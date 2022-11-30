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
        console.log(req.body);
        if(!files || !type || !role) return res.status(400).json({success: false, message: "Invalid data format"});
        if(files.length == 0) return res.status(400).json({success: false, message: "No files specified"});
        if(userProfile.fileSharingSnapshots.length == 0) return res.status(400).json({success: false, message: "No file-sharing snapshot in user profile"});
        console.log("Adding permission...");
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
            try {
                let present = {};
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission of same {type, role, value} is not present in file.permissions,
                        // then make an API call to add new permission for file
                        present[file.id] = false;
                        for(const permission of file.permissions) {
                            if(permission.type === type && permission.role === role) {
                                if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                    present[file.id] = true;
                                }
                                else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                    present[file.id] = true;
                                }
                                else if(permission.type === "anyone") present[file.id] = true;
                            }
                        }
                        if(!present[file.id]) {
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
                        }
                    }
                }
                for(const file of files) {
                    if(!present[file.id]) {
                        let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    timestamp: Date.now(),
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
            // Make sure to refresh access token before attempting to access Microsoft Graph API
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

            try {
                for(const file of files) {
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
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.parentReference.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                    timestamp: Date.now(),
                    action: 'add'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
        // Save to database
        try {
            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].updatedAt = Date.now();
            userProfile.markModified('fileSharingSnapshots');
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        console.log('Permission added');
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
        console.log("Removing permission...");
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
            try {
                let present = {};
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission of same {type, role, value} is present in file.permissions,
                        // then make an API call to remove permission for file
                        present[file.id] = false;
                        for(const permission of file.permissions) {
                            if(permission.type === type && permission.role === role) {
                                if((permission.type === "user" || permission.type === "group") && permission.emailAddress.toLowerCase() === value.toLowerCase()) {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    }).catch(() => null);
                                    present[file.id] = true;
                                }
                                else if(permission.type === "domain" && permission.domain.toLowerCase() === value.toLowerCase()) {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    }).catch(() => null);
                                    present[file.id] = true;
                                }
                                else if(permission.type === "anyone") {
                                    await googleDrive.permissions.delete({
                                        fileId: file.id,
                                        permissionId: permission.id,
                                        supportsAllDrives: true
                                    }).catch(() => null);
                                    present[file.id] = true;
                                }
                            }
                        }
                    }
                }
                for(const file of files) {
                    if(present[file.id]) {
                        let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: type,
                    permissionRole: role,
                    permissionValue: value,
                    timestamp: Date.now(),
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
            // Make sure to refresh access token before attempting to access Microsoft Graph API
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

            try {
                for(const file of files) {
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
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.parentReference.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                    timestamp: Date.now(),
                    action: 'remove'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
        // Save to database
        try {
            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].updatedAt = Date.now();
            userProfile.markModified('fileSharingSnapshots');
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        console.log('Permission removed');
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
        console.log("Unsharing files...");
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
            try {
                let shared = {};
                for(const file of files) {
                    // A user is only authorized to make permission requests for files that include a permissions array
                    if(file.permissions) {
                        // If permission has a non-"owner" role in file.permissions (i.e., file is shared),
                        // then make an API call to remove permission for file
                        shared[file.id] = false;
                        for(const permission of file.permissions) {
                            if(permission.role !== "owner") {
                                await googleDrive.permissions.delete({
                                    fileId: file.id,
                                    permissionId: permission.id
                                }).catch(() => null);
                                shared[file.id] = true;
                            }
                        }
                    }
                }
                for(const file of files) {
                    if(shared[file.id]) {
                        let updatedPermissions = await getPermissionsGoogle(googleDrive, file.id);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.mimeType === 'application/vnd.google-apps.folder' && file.path) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                // Log sharing changes
                userProfile.sharingChangesLog.push({
                    files: files,
                    permissionType: 'n/a',
                    permissionRole: 'n/a',
                    permissionValue: 'n/a',
                    timestamp: Date.now(),
                    action: 'unshare'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }

        else if(userProfile.user.driveType === "microsoft") {
            // Make sure to refresh access token before attempting to access Microsoft Graph API
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

            try {
                for(const file of files) {
                    let shared = false;
                    for(const permission of file.permissions.value) {
                        if (!permission.roles.includes("owner")) {
                            await graph.deletePermission(accessToken, file.id, file.parentReference.driveId, permission.id);
                            shared = true;
                        }
                    }
                    if(shared) {
                        let updatedPermissions = await graph.getSharedItemPermissions(accessToken, file.id, file.parentReference.driveId);
                        // Find file in most recent file-sharing snapshot and update its permissions
                        userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data.forEach((f, index) => {
                            if(f.id === file.id)
                                userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data[index].permissions = updatedPermissions;
                        });
                        if(file.folder && file.folder.childCount > 0) {
                            // If file is a folder, get IDs of all files under it, make API calls to get permissions for each file,
                            // and update each file's permissions
                            let fileIds = getFilesIdsUnderFolder(userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data, file.parentReference.path + '/' + file.name, file.id, userProfile.user.driveType);
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
                    permissionType: 'n/a',
                    permissionRole: 'n/a',
                    permissionValue: 'n/a',
                    timestamp: Date.now(),
                    action: 'unshare'
                });
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
        // Save to database
        try {
            userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].updatedAt = Date.now();
            userProfile.markModified('fileSharingSnapshots');
            await userProfile.save();
        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: "Error"});
        }
        console.log('Unshared files');
        return sendUserProfile(res, userProfile);
    });
});

router.get('/checksnapshotconsistency', async (req, res) => {
    // Check consistency of files and permissions between
    // cloud drive and most recent file-sharing snapshot
    if(!req.user) return res.status(401).json({success: false, message: "Error"});

    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        if(userProfile.fileSharingSnapshots.length == 0) return res.status(400).json({success: false, message: "No file-sharing snapshot in user profile"});
        console.log("Checking snapshot consistency...");
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
            try {
                // Check whether files in the most recent file-sharing snapshot exist in Google Drive
                for(const file of userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data) {
                    await googleDrive.files.get({
                        fileId: file.id,
                        supportsAllDrives: true
                    });
                }
            } catch(err) {
                console.log(err);
                return res.status(200).json({success: false, message: "The most recent file-sharing snapshot is inconsistent (i.e., not up-to-date) with Google Drive! Please take a new file-sharing snapshot."});
            }
            try {
                // Check whether file permissions match the permissions in Google Drive
                for(const file of userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data) {
                    if(file.permissions) {
                        let drivePermissions = await getPermissionsGoogle(googleDrive, file.id);
                        let drivePermissionsIds = new Set(drivePermissions.map(p => p.id));
                        let snapshotPermissionIds = new Set(file.permissions.map(p => p.id));
                        if(!setsEqual(drivePermissionsIds, snapshotPermissionIds))
                            return res.status(200).json({success: false, message: "The most recent file-sharing snapshot is inconsistent (i.e., not up-to-date) with Google Drive! Please take a new file-sharing snapshot."});
                    }
                }
                console.log('Done checking snapshot consistency');
                return res.status(200).json({success: true, message: "The most recent file-sharing snapshot is consistent (i.e., up-to-date) with Google Drive."});
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }

        else if(userProfile.user.driveType === "microsoft") {
            // Make sure to refresh access token before attempting to access Microsoft Graph API
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

            try {
                // Check whether files in the most recent file-sharing snapshot exist in Microsoft OneDrive
                for(const file of userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data) {
                    await graph.getSharedItem(accessToken, file.id, file.parentReference.driveId);
                }
            } catch(err) {
                console.log(err);
                return res.status(200).json({success: false, message: "The most recent file-sharing snapshot is inconsistent (i.e., not up-to-date) with Microsoft OneDrive! Please take a new file-sharing snapshot."});
            }
            try {
                // Check whether file permissions match the permissions in Microsoft OneDrive
                for(const file of userProfile.fileSharingSnapshots[userProfile.fileSharingSnapshots.length - 1].data) {
                    let drivePermissions = await graph.getSharedItemPermissions(accessToken, file.id, file.parentReference.driveId);
                    let drivePermissionsIds = new Set(drivePermissions.value.map(p => p.id));
                    let snapshotPermissionIds = new Set(file.permissions.value.map(p => p.id));
                    if(!setsEqual(drivePermissionsIds, snapshotPermissionIds))
                        return res.status(200).json({success: false, message: "The most recent file-sharing snapshot is inconsistent (i.e., not up-to-date) with Microsoft OneDrive! Please take a new file-sharing snapshot."});
                }
                return res.status(200).json({success: true, message: "The most recent file-sharing snapshot is consistent (i.e., up-to-date) with Microsoft OneDrive."});
            } catch(err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Error"});
            }
        }
    });
});

function getFilesIdsUnderFolder(snapshot, path, id, driveType) {
    let fileIds = [];
    if (driveType === "google") {
        if(!path) return fileIds;
        for(const file of snapshot) {
            // Only consider files with permissions array!
            if(file.permissions && file.path && file.path.startsWith(path) && file.id !== id) {
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
            fileId: id,
            permissionId: permission.id,
            supportsAllDrives: true,
            fields: "*"
        });
        return resp.data;
    }));
    return updatedPermissions;
}

function setsEqual(s1, s2) {
    if (s1.size !== s2.size) return false;
    for (const element of s1) {
        if (!s2.has(element)) return false;
    }
    return true;
}

module.exports = router;