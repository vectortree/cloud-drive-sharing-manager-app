const router = require("express").Router();
const { google } = require('googleapis');
const graph = require('../graph.js');
const UserProfile = require('../models/UserProfile');
const refresh = require('passport-oauth2-refresh');

async function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

router.post('/addpermission', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});

    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { files, type, role, value } = req.body;

        if(!files || !type || !role) return res.status(400).json({success: false, message: "Invalid data format"});
        if(files.length == 0) return res.status(400).json({success: false, message: "No files specified"});
        if(userProfile.fileSharingSnapshots.length == 0) return res.status(400).json({success: false, message: "No file-sharing snapshot in user profile"});
        if(userProfile.user.driveType === "google") {
            if((type === "user" || type === "group" || type === "domain") && !value) return res.status(400).json({success: false, message: "Invalid data format"});
            if(type !== "user" && type !== "group" && type !== "domain" && type !== "anyone") return res.status(400).json({success: false, message: "Invalid type"});
            if(role !== "writer" && role !== "reader" && role !== "commenter") return res.status(400).json({success: false, message: "Invalid role"});
            // Make sure to refresh access token before attempting to access Google Drive API
            if(userProfile.user.tokens.refresh_token) {
                refresh.requestNewAccessToken(
                    'google',
                    userProfile.user.tokens.refresh_token,
                    function (err, accessToken, refreshToken) {
                        // Store new tokens in database
                        userProfile.user.tokens.access_token = accessToken;
                        userProfile.user.tokens.refresh_token = refreshToken;
                        userProfile.save();
                    },
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
            try {
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission of same {type, role, value} is not present in file.permissions,
                        // then make an API call to add new permission for file
                        let present = false;
                        for(const permission of file.permissions) {
                            if(permission.type === type && permission.role === role) {
                                if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                    present = true;
                                }
                                else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                    present = true;
                                }
                                else if(permission.type === "anyone") present = true;
                            }
                        }
                        if(!present) {
                            if(type === "user" || type === "group") {
                                await googleDrive.permissions.create({
                                    fileId: file.id,
                                    supportsAllDrives: true,
                                    requestBody: {
                                        role: role,
                                        type: type,
                                        emailAddress: value.toLowerCase()
                                    }
                                });
                            }
                            else if(type === "domain") {
                                await googleDrive.permissions.create({
                                    fileId: file.id,
                                    supportsAllDrives: true,
                                    requestBody: {
                                        role: role,
                                        type: type,
                                        domain: value.toLowerCase()
                                    }
                                });
                            }
                            else if(type === "anyone") {
                                await googleDrive.permissions.create({
                                    fileId: file.id,
                                    supportsAllDrives: true,
                                    requestBody: {
                                        role: role,
                                        type: type
                                    }
                                });
                            }
                            let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                            // Find file in most recent file-sharing snapshot and update its permissions
                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                if(f.id === file.id)
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                            });
                            if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                                // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                                // and update each file's permissions
                                let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id, "google");
                                for(const id of fileIds) {
                                    updatedPermissions = await getPermissionsGoogle(googleDrive, id);
                                    // Find file in most recent file-sharing snapshot and update its permissions
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                        if(f.id === id)
                                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                                    });
                                }
                            }
                        }
                    }
                }
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    action: 'add'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }

        else if(userProfile.user.driveType === "microsoft") {
            if(type === "users" && !value) return res.status(400).json({success: false, message: "Invalid data format"});
            if(type !== "users" && type !== "organization" && type !== "anonymous") return res.status(400).json({success: false, message: "Invalid type"});
            if((type === "users" && role !== "read" && role !== "write") || ((type === "organization" || type === "anonymous") && role !== "view" && role !== "review" && role !== "edit")) return res.status(400).json({success: false, message: "Invalid role"});
            // Make sure to refresh access token before attempting to access Google Drive API
            if(userProfile.user.tokens.refresh_token) {
                refresh.requestNewAccessToken(
                    'microsoft',
                    userProfile.user.tokens.refresh_token,
                    function (err, accessToken, refreshToken) {
                        // Store new tokens in database
                        userProfile.user.tokens.access_token = accessToken;
                        userProfile.user.tokens.refresh_token = refreshToken;
                        userProfile.save();
                    }
                );
            }

            const accessToken = userProfile.user.tokens.access_token;

            try {
                for(const file of files) {
                    // If permission of same {type, role, value} is not present in file.permissions,
                    // then make an API call to add new permission for file
                    let present = false;
                    for(const permission of file.permissions.value) {
                        if ((type === "organization" || type === "anonymous") && permission.link && permission.link.scope === type && permission.link.type === role) {
                            present = true
                        }
                        else if (type === "users" && permission.roles.includes(role)) {
                            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                                for (const user of permission.grantedToIdentitiesV2) {
                                    if (user.siteUser.email.toLowerCase() === value.toLowerCase())
                                        present = true;
                                }
                            } else if (permission.grantedToV2) {
                                if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase())
                                    present = true;
                            }
                        }
                    }
                    if(!present) {
                        if(type === "users") {
                            await graph.addPermission(
                                accessToken, 
                                file.id, 
                                file.parentReference.driveId, 
                                {
                                    recipients: [
                                        { email: value }
                                    ],
                                    roles: [ role ]
                                }
                            );
                        }
                        else {
                            await graph.createSharingLink(
                                accessToken, 
                                file.id, 
                                file.parentReference.driveId, 
                                {
                                    type: role,
                                    scope: type
                                }
                            );
                        }
                        let updatedPermissions = await graph.getSharedItemPermissions(accessToken, file.id, file.parentReference.driveId);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.folder && file.folder.childCount > 0) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.parentReference.path + '/' + file.name, file.id, "microsoft");
                            for(const id of fileIds) {
                                updatedPermissions = await graph.getSharedItemPermissions(accessToken, id, file.parentReference.driveId);
                                // Find file in most recent file-sharing snapshot and update its permissions
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                    if(f.id === id)
                                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                                });
                            }
                        }
                    }
                }
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    action: 'add'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
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

router.post('/removepermission', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});

    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { files, type, role, value } = req.body;

        if(!files || !type || !role) return res.status(400).json({success: false, message: "Invalid data format"});
        if(files.length == 0) return res.status(400).json({success: false, message: "No files specified"});
        if(userProfile.fileSharingSnapshots.length == 0) return res.status(400).json({success: false, message: "No file-sharing snapshot in user profile"});
        if(userProfile.user.driveType === "google") {
            if((type === "user" || type === "group" || type === "domain") && !value) return res.status(400).json({success: false, message: "Invalid data format"});
            if(type !== "user" && type !== "group" && type !== "domain" && type !== "anyone") return res.status(400).json({success: false, message: "Invalid type"});
            if(role !== "writer" && role !== "reader" && role !== "commenter") return res.status(400).json({success: false, message: "Invalid role"});
            // Make sure to refresh access token before attempting to access Google Drive API
            if(userProfile.user.tokens.refresh_token) {
                refresh.requestNewAccessToken(
                    'google',
                    userProfile.user.tokens.refresh_token,
                    function (err, accessToken, refreshToken) {
                        // Store new tokens in database
                        userProfile.user.tokens.access_token = accessToken;
                        userProfile.user.tokens.refresh_token = refreshToken;
                        userProfile.save();
                    },
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
            try {
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission of same {type, role, value} is present in file.permissions,
                        // then make an API call to remove permission for file
                        let present = false;
                        for(const permission of file.permissions) {
                            if(permission.type === type && permission.role === role) {
                                if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    });
                                    present = true;
                                }
                                else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    });
                                    present = true;
                                }
                                else if(permission.type === "anyone") {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    });
                                    present = true;
                                }
                            }
                        }
                        if(present) {
                            let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                            // Find file in most recent file-sharing snapshot and update its permissions
                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                if(f.id === file.id)
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                            });
                            if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                                // If file is a folder, get file IDs of all files under it, make API calls to get permissions for each file,
                                // and update each file's permissions
                                let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id, "google");
                                for(const id of fileIds) {
                                    updatedPermissions = await getPermissionsGoogle(googleDrive, id);
                                    // Find file in most recent file-sharing snapshot and update its permissions
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                        if(f.id === id)
                                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                                    });
                                }
                            }
                        }
                    }
                }
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    action: 'remove'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }

        else if(userProfile.user.driveType === "microsoft") {
            if(type === "users" && !value) return res.status(400).json({success: false, message: "Invalid data format"});
            if(type !== "users" && type !== "organization" && type !== "anonymous") return res.status(400).json({success: false, message: "Invalid type"});
            if((type === "users" && role !== "read" && role !== "write") || ((type === "organization" || type === "anonymous") && role !== "view" && role !== "review" && role !== "edit")) return res.status(400).json({success: false, message: "Invalid role"});
            // Make sure to refresh access token before attempting to access Google Drive API
            if(userProfile.user.tokens.refresh_token) {
                refresh.requestNewAccessToken(
                    'microsoft',
                    userProfile.user.tokens.refresh_token,
                    function (err, accessToken, refreshToken) {
                        // Store new tokens in database
                        userProfile.user.tokens.access_token = accessToken;
                        userProfile.user.tokens.refresh_token = refreshToken;
                        userProfile.save();
                    }
                );
            }

            const accessToken = userProfile.user.tokens.access_token;

            try {
                for(const file of files) {
                    // If permission of same {type, role, value} is not present in file.permissions,
                    // then make an API call to add new permission for file
                    let present = false;
                    for(const permission of file.permissions.value) {
                        if ((type === "organization" || type === "anonymous") && permission.link && permission.link.scope === type && permission.link.type === role) {
                            await graph.deletePermission(accessToken, file.id, file.parentReference.driveId, permission.id);
                            present = true;
                        }
                        else if (type === "users" && permission.roles.includes(role)) {
                            if (permission.grantedToIdentitiesV2 && permission.grantedToIdentitiesV2.length > 0) {
                                for (const user of permission.grantedToIdentitiesV2) {
                                    if (user.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                        await graph.deletePermission(accessToken, file.id, file.parentReference.driveId, permission.id);
                                        present = true;
                                    }
                                }
                            } else if (permission.grantedToV2) {
                                if (permission.grantedToV2.siteUser.email.toLowerCase() === value.toLowerCase()) {
                                    await graph.deletePermission(accessToken, file.id, file.parentReference.driveId, permission.id);
                                    present = true;
                                }
                            }
                        }
                    }
                    if(present) {
                        let updatedPermissions = await graph.getSharedItemPermissions(accessToken, file.id, file.parentReference.driveId);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.folder && file.folder.childCount > 0) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.parentReference.path + '/' + file.name, file.id, "microsoft");
                            for(const id of fileIds) {
                                updatedPermissions = await graph.getSharedItemPermissions(accessToken, id, file.parentReference.driveId);
                                // Find file in most recent file-sharing snapshot and update its permissions
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                    if(f.id === id)
                                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                                });
                            }
                        }
                    }
                }
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    action: 'add'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
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

router.post('/unsharefiles', async (req, res) => {
    // Note: Front-end should only send files in MyDrive
    if(!req.user) return res.status(401).json({success: false, message: "Error"});

    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { files } = req.body;

        if(!files) return res.status(400).json({success: false, message: "Invalid data format"});
        if(files.length == 0) return res.status(400).json({success: false, message: "No files specified"});
        if(userProfile.fileSharingSnapshots.length == 0) return res.status(400).json({success: false, message: "No file-sharing snapshot in user profile"});
        if(userProfile.user.driveType === "google") {
            // Make sure to refresh access token before attempting to access Google Drive API
            if(userProfile.user.tokens.refresh_token) {
                refresh.requestNewAccessToken(
                    'google',
                    userProfile.user.tokens.refresh_token,
                    function (err, accessToken, refreshToken) {
                        // Store new tokens in database
                        userProfile.user.tokens.access_token = accessToken;
                        userProfile.user.tokens.refresh_token = refreshToken;
                        userProfile.save();
                    },
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
            try {
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission has a non-"owner" role in file.permissions (i.e., file is shared),
                        // then make an API call to remove permission for file
                        let shared = false;
                        for(const permission of file.permissions) {
                            if(permission.role !== "owner") {
                                await googleDrive.permissions.delete({
                                    fileId: file.id,
                                    permissionId: permission.id
                                });
                                shared = true;
                            }
                        }
                        if(shared) {
                            let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                            // Find file in most recent file-sharing snapshot and update its permissions
                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                if(f.id === file.id)
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                            });
                            if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                                // If file is a folder, get file IDs of all files under it, make API calls to get permissions for each file,
                                // and update each file's permissions
                                let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id);
                                for(const id of fileIds) {
                                    updatedPermissions = await getPermissionsGoogle(googleDrive, id);
                                    // Find file in most recent file-sharing snapshot and update its permissions
                                    userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                                        if(f.id === id)
                                            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                                    });
                                }
                            }
                        }
                    }
                }
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: 'n/a',
                    permissionRole: 'n/a',
                    permissionValue: 'n/a',
                    action: 'unshare'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
        // TODO
        else if(userProfile.user.driveType === "microsoft") {
        }
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

// TODO
router.post('/checksnapshotconsistency', async (req, res) => {
    // Check consistency of files and permissions between
    // cloud drive and most recent file-sharing snapshot
});

function getFilesIdsUnderFolder(snapshot, path, id, driveType) {
    let fileIds = [];
    if (driveType === "google") {
        if(!path) return fileIds;
        for(const file of snapshot) {
            if(file.path && file.path.startsWith(path) && file.id !== id) {
                fileIds.push(file.id);
            }
        }
    }
    else if (driveType === "microsoft") {
        for(const file of snapshot) {
            if(file.parentReference.path.startsWith(path) && file.id !== id) {
                fileIds.push(file.id);
            }
        }
    }
    return fileIds;
}

async function getPermissionsGoogle(googleDrive, id) {
    // Make API calls to get all permissions for file
    let updatedPermissions = [];
    let permissionsList = [];
    let NextPageToken = "";
    do {
        let p = {
            fileId: id,
            supportsAllDrives: true,
            pageSize: 100
        };
        if(NextPageToken) {
            p = {
                fileId: id,
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
    updatedPermissions = await Promise.all(permissionsList.map(async (permission) => {
        let resp = await googleDrive.permissions.get({
            fileId: file.id,
            permissionId: permission.id,
            supportsAllDrives: true,
            fields: "*"
        });
        return resp.data;
    }));
    return updatedPermissions;
}

module.exports = router;