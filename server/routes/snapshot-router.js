// All necessary back-end operations (e.g., CRUD) for snapshots will be written here
// Note that there's no need for the client to "GET" a snapshot
// since the client will be able to access all the snapshots in the user profile
const router = require("express").Router();
const { google } = require('googleapis');
const UserProfile = require('../models/UserProfile');
const refresh = require('passport-oauth2-refresh');
const graph = require('../graph.js');
const cheerio = require('cheerio');
const validator = require('html-validator');
const fs = require('fs');

let fileDataList = [];

async function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

async function getDriveItems(accessToken, path) {
    const driveItems = await graph.getDriveItemChildren(accessToken, path);
    await Promise.all(driveItems.value.map(async (driveItem) => {
        let metadata = driveItem;

        // Gets the permissions for a particular driveItem and adds it to the metadata
        await graph.getDriveItemPermissions(accessToken, metadata.id).then(async (permissions) => {
            metadata['permissions'] = permissions;
            metadata['driveName'] = "OneDrive";
            fileDataList.push(metadata);
            if (metadata.folder && metadata.folder.childCount > 0) {
                let p = metadata.parentReference.path + '/' + metadata.name + ':';
                await getDriveItems(accessToken, p);
            }
        });
    }));
}

async function getGoogleDriveFileResponses(googleDrive, files) {
    const getFileResponses = files.map((file) => {
        let parameters = {
            fileId: file.id,
            supportsAllDrives: true,
            fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime, parents, sharingUser, owners, lastModifyingUser, permissions, driveId, writersCanShare"
        };
        return googleDrive.files.get(parameters);
    });
    const fileResponses = await Promise.all(getFileResponses);
    return fileResponses;
}

async function pushGoogleDriveFileMetadata(googleDrive, fileResponses, sharedDriveCache) {
    for(const resp of fileResponses) {
        let metadata = resp.data;
        // If driveId is non-null (i.e., file is in a shared drive),
        // then make an API call to get the name of the shared drive and append
        // the name to metadata
        if(metadata.driveId) {
            try {
                // Cache miss
                if(!(metadata.driveId in sharedDriveCache)) {
                    let response = await googleDrive.drives.get({driveId: metadata.driveId});
                    metadata.driveName = response.data.name;
                    // Cache the driveId and its associated driveName
                    sharedDriveCache[metadata.driveId] = metadata.driveName;
                    console.log("Cache miss");
                }
                // Cache hit
                else {
                    metadata.driveName = sharedDriveCache[metadata.driveId];
                    console.log("Cache hit");
                }
            } catch(err) {
                // If driveId is non-null and the API call is unsuccessful,
                // then the file is in a shared drive of which the user is
                // NOT a member of, and thus the file should be in "Shared with me"
                metadata.driveName = "SharedWithMe";
            }
        }
        // Note: The assumption is that every file should have exactly one owner
        // A file is in "My Drive" or "Shared with me" if and only if:
        // 1) owners is non-null, and
        // 2) owners.length > 0
        else if(metadata.owners && metadata.owners.length > 0) {
            // A file is in "My Drive" if and only if owners[0].me is true
            // Note: Equivalently, we could check if ownedByMe is true
            // but this requires getting an extra field, which is redundant
            if(metadata.owners[0].me) {
                metadata.driveName = "MyDrive";
            }
            // A file is in "Shared with me" if and only if owners[0].me is false
            // Note: Equivalently, we could check if ownedByMe is false
            // but this requires getting an extra field, which is redundant
            else {
                metadata.driveName = "SharedWithMe";
            }
        }
        fileDataList.push(metadata);
    }
    console.log("Pushed file metadata for entire page");
    return sharedDriveCache;
}

async function getSharedItemsRoot(accessToken) {
    const sharedItems = await graph.getAllSharedItems(accessToken);
    await Promise.all(sharedItems.value.map(async (sharedItem) => {
        let itemId = sharedItem.id;
        let driveId = sharedItem.remoteItem.parentReference.driveId;
        let shared = sharedItem.remoteItem.shared;

        try {
            // Gets the complete metadata for a shared item
            await graph.getSharedItem(accessToken, itemId, driveId).then(async (sharedItem) => {
                let metadata = sharedItem;
                metadata["shared"] = shared;

                await graph.getSharedItemPermissions(accessToken, itemId, driveId).then(async (permissions) => {
                    metadata['permissions'] = permissions;
                    metadata['driveName'] = "SharedWithMe";
                    fileDataList.push(metadata);
                    if (metadata.folder && metadata.folder.childCount > 0) {
                        await getSharedItemChildren(accessToken, itemId, driveId);
                    }
                });
            });
        } catch (e) {
            console.log("Shared item cannot be accessed", sharedItem);
        }
        
    }));
}

async function getSharedItemChildren(accessToken, itemId, driveId) {
    const sharedItems = await graph.getSharedItemChildren(accessToken, itemId, driveId);

    await Promise.all(sharedItems.value.map(async (sharedItem) => {
        let metadata = sharedItem;

        let itemId = sharedItem.id;
        let driveId = sharedItem.parentReference.driveId;

        // Gets the permissions for a particular shared item and adds it to the metadata
        await graph.getSharedItemPermissions(accessToken, itemId, driveId).then(async (permissions) => {
            metadata['permissions'] = permissions;
            metadata['driveName'] = "SharedWithMe";
            fileDataList.push(metadata);
            if (metadata.folder && metadata.folder.childCount > 0) {
                await getSharedItemChildren(accessToken, metadata.id, metadata.parentReference.driveId);
            }
        });
    }));
}

router.post('/createfilesharingsnapshot', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { id } = req.body;
        try {
            if(userProfile.user.driveType === "microsoft") {
                // Make sure to refresh tokens before attempting to access Microsoft Graph API
                if(userProfile.user.tokens.refresh_token) {
                    refresh.requestNewAccessToken(
                        'microsoft',
                        userProfile.user.tokens.refresh_token,
                        function (err, accessToken, refreshToken) {
                            // Store new tokens in database
                            userProfile.user.tokens.access_token = accessToken;
                            userProfile.user.tokens.refresh_token = refreshToken;
                        }
                    );
                }

                const accessToken = userProfile.user.tokens.access_token;

                // Call Microsoft Graph API method recursively to get all file permission data and metadata
                await getDriveItems(accessToken, '/drive/root');
                await getSharedItemsRoot(accessToken);
                
            }
            else if(userProfile.user.driveType === "google") {
                // Make sure to refresh access token before attempting to access Google Drive API
                if(userProfile.user.tokens.refresh_token) {
                    refresh.requestNewAccessToken(
                        'google',
                        userProfile.user.tokens.refresh_token,
                        function (err, accessToken, refreshToken) {
                            // Store new tokens in database
                            userProfile.user.tokens.access_token = accessToken;
                            userProfile.user.tokens.refresh_token = refreshToken;
                        }
                    );
                }
                const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET, process.env.CLIENT_URL);
                
                oAuth2Client.setCredentials(userProfile.user.tokens);
                // Create Google Drive object to call API
                const googleDrive = google.drive({
                    version: 'v3',
                    auth: oAuth2Client
                });

                // Cache the driveId and driveName for shared drives to minimize API calls
                let sharedDriveCache = {};

                // Call Google Drive API methods to get all file permission data and metadata
                let NextPageToken = "";
                do {
                    const params = {
                        corpora: "allDrives",
                        includeItemsFromAllDrives: true,
                        supportsAllDrives: true,
                        pageSize: 500,
                        pageToken: NextPageToken || ""
                    };

                    let response = await googleDrive.files.list(params);
                    const files = response.data.files;
                    // Get file metadata and permissions
                    let fileResponses = await getGoogleDriveFileResponses(googleDrive, files);
                    sharedDriveCache = await pushGoogleDriveFileMetadata(googleDrive, fileResponses, sharedDriveCache);
                    NextPageToken = response.data.nextPageToken;
                } while(NextPageToken);

                // Get permissions for all files
                for(let i = 0; i < fileDataList.length; i++) {
                    // File in shared drive
                    if(fileDataList[i].driveId) {
                        let permissionsList = [];
                        NextPageToken = "";
                        do {
                            let p = {
                                fileId: fileDataList[i].id,
                                supportsAllDrives: true,
                                pageSize: 100
                            };
                            if(NextPageToken) {
                                p = {
                                    fileId: fileDataList[i].id,
                                    supportsAllDrives: true,
                                    pageSize: 100,
                                    pageToken: NextPageToken
                                };
                            }
                            let permissionsResponse = await googleDrive.permissions.list(p);
                            permissionsList = permissionsList.concat(permissionsResponse.data.permissions);
                            NextPageToken = permissionsResponse.data.nextPageToken;
                        } while(NextPageToken);
                        // Map each permission to its associated metadata (by making an API call per permission)
                        fileDataList[i].permissions = await Promise.all(permissionsList.map(async (permission) => {
                            let resp = await googleDrive.permissions.get({
                                fileId: fileDataList[i].id,
                                permissionId: permission.id,
                                supportsAllDrives: true,
                                fields: "*"
                            });
                            //console.log(permission);
                            //console.log(resp.data);
                            return resp.data;
                        }));
                    }
                }

                // Add a path field for all files
                let folderIdsToPaths = {};
                let size = 0;
                let rootResponse = await googleDrive.files.get({fileId: 'root', fields: 'id'});
                const myDriveId = rootResponse.data.id;
                for(let i = 0; i < fileDataList.length; i++) {
                    // Top-level file
                    if(!fileDataList[i].parents || (fileDataList[i].parents.length > 0 && (fileDataList[i].parents[0] === myDriveId || (fileDataList[i].parents[0] in sharedDriveCache)))) {
                        fileDataList[i].path = '/' + fileDataList[i].driveName;
                        fileDataList[i].topLevel = true;
                        if(fileDataList[i].mimeType === 'application/vnd.google-apps.folder') {
                            folderIdsToPaths[fileDataList[i].id] = fileDataList[i].path + '/' + fileDataList[i].name;
                            size++;
                        }
                    }
                }
                while(size > 0) {
                    let newFolderIdsToPaths = {};
                    size = 0;
                    for(let i = 0; i < fileDataList.length; i++) {
                        // File is a child of some parent file in the previous level
                        if(fileDataList[i].parents && fileDataList[i].parents.length > 0 && (fileDataList[i].parents[0] in folderIdsToPaths)) {
                            fileDataList[i].path = folderIdsToPaths[fileDataList[i].parents[0]];
                            fileDataList[i].topLevel = false;
                            if(fileDataList[i].mimeType === 'application/vnd.google-apps.folder') {
                                newFolderIdsToPaths[fileDataList[i].id] = fileDataList[i].path + '/' + fileDataList[i].name;
                                size++;
                            }
                        }
                    }
                    folderIdsToPaths = newFolderIdsToPaths;
                }
            }
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        // Create new file sharing snapshot to store in user profile
        fileDataList.map((file) => console.log(file));
        // If fileDataList is empty, then there are no files accessible
        // by either Google Drive API or Microsoft Graph API
        // In this case, return without creating a snapshot
        if(fileDataList.length == 0) {
            return res.status(400).json({success: false, message: "No files found in drive"});
        }
        console.log("Creating file-sharing snapshot");
        const defaultName = "fs_snapshot";
        const snapshotNumber = userProfile.fileSharingSnapshots.length + 1;
        // Create a default name
        let snapshotName = defaultName + snapshotNumber;
        // If name specified, replace snapshotName with user-specified name
        if(req.body.name && req.body.name.trim() !== "") snapshotName = req.body.name;
        const currentDate = new Date();
        const snapshot = {
            id: parseInt(id),
            name: snapshotName,
            createdAt: currentDate,
            updatedAt: currentDate,
            data: fileDataList
        };
        userProfile.fileSharingSnapshots.push(snapshot);
        // Save to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        fileDataList = [];
        return sendUserProfile(res, userProfile);
    });
});

router.post('/creategroupmembershipsnapshot', async (req, res) => {
    // Note: This is only supported for Google Drive.
    // The user enters the name and email address of a Google group.
    // In addition, the user uploads an HTML file (which is obtained by
    // manually visiting and saving the group's Members page).
    // Note: In principle, the timestamp should be the time when the HTML file was saved.
    // The server-side will generate an approximate timestamp for the user, if none specified by the user.
    // In the front-end, the timestamp field is optional.
    // In the back-end, the system extracts the group membership information
    // from this HTML file and saves it as a snapshot with the following properties:
    // Snapshot name, group name, group email address, timestamp (date), and list of members
    // Note: A group-membership snapshot refers to the saved membership (i.e., a list of members) of a single group.
    console.log(req.body);
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(userProfile.user.driveType !== "google")
            return res.status(400).json({success: false, message: "Invalid drive type"});
        
        const {
            id,
            name,
            groupName,
            groupAddress,
            timestamp,
            htmlFile } = req.body;

        // Group name, group email address, and HTML file must be specified
        if(!groupName || !groupAddress || !htmlFile)
            return res.status(400).json({success: false, message: "Invalid data format"});
        
        // The system should only be able to scrape the membership of a group if the user has
        // permission to see the email addresses of the group members

        // Extract group membership information from the HTML file and store it in an array
        let membersList = [];

        // Load the HTML markup using cheerio.load
        const $ = cheerio.load(htmlFile);

        const members = $('a[href^="mailto:"]');

        if(members.length == 0) return res.status(400).json({success: false, message: "Invalid HTML file. No group members found."});

        members.each((index, element) => membersList.push($(element).attr("href").replace("mailto:", "")));

        // Create group-membership snapshot
        console.log("Creating group-membership snapshot");
        const defaultName = "gm_snapshot";
        const snapshotNumber = userProfile.groupMembershipSnapshots.length + 1;
        // Create a default name
        let snapshotName = defaultName + snapshotNumber;
        // If name specified, replace snapshotName with user-specified name
        if(name && name.trim() !== "") snapshotName = name;

        // This is for timestamp fields related to the snapshot itself
        let currentDate = new Date();
        // If timestamp not specified by user, use an approximate timestamp
        let stamp = currentDate;
        if(timestamp) stamp = timestamp;

        const snapshot = {
            id: parseInt(id),
            name: snapshotName,
            groupName: groupName,
            groupAddress: groupAddress.toLowerCase(),
            timestamp: stamp,
            createdAt: currentDate,
            updatedAt: currentDate,
            members: Array.from(new Set(membersList.map(m => m.toLowerCase())))
        };
    
        userProfile.groupMembershipSnapshots.push(snapshot);
        // Save to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        return sendUserProfile(res, userProfile);
    });
});

router.put('/editfilesharingsnapshot/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        console.log("Editing name of file-sharing snapshot");
        if(!req.body.name || req.body.name.trim() === "")
            return res.status(400).json({success: false, message: "Invalid data format"});
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.fileSharingSnapshots.length)
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        let index = userProfile.fileSharingSnapshots
                    .findIndex(s => s.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        const currentDate = new Date();
        userProfile.fileSharingSnapshots[index].name = req.body.name;
        userProfile.fileSharingSnapshots[index].updatedAt = currentDate;
        // Save changes to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        return sendUserProfile(res, userProfile);
    });
});

router.delete('/removefilesharingsnapshot/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.fileSharingSnapshots.length)
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        let index = userProfile.fileSharingSnapshots
                    .findIndex(s => s.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        console.log("Deleting file-sharing snapshot");
        userProfile.fileSharingSnapshots.splice(index, 1);
        // Save changes to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        return sendUserProfile(res, userProfile);
    });
});

router.put('/editgroupmembershipsnapshot/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        console.log("Editing name of group-membership snapshot");
        if(!req.body.name || req.body.name.trim() === "")
            return res.status(400).json({success: false, message: "Invalid data format"});
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.groupMembershipSnapshots.length)
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        let index = userProfile.groupMembershipSnapshots
                    .findIndex(s => s.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        const currentDate = new Date();
        userProfile.groupMembershipSnapshots[index].name = req.body.name;
        userProfile.groupMembershipSnapshots[index].updatedAt = currentDate;
        // Save changes to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        return sendUserProfile(res, userProfile);
    });
});

router.delete('/removegroupmembershipsnapshot/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.groupMembershipSnapshots.length)
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        let index = userProfile.groupMembershipSnapshots
                    .findIndex(s => s.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        console.log("Deleting group-membership snapshot");
        userProfile.groupMembershipSnapshots.splice(index, 1);
        // Save changes to database
        try {
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        return sendUserProfile(res, userProfile);
    });
});

module.exports = router;