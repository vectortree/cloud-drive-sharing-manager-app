// All necessary back-end operations (e.g., CRUD) for snapshots will be written here
// Note that there's no need for the client to "GET" a snapshot
// since the client will be able to access all the snapshots in the user profile
const router = require("express").Router();
const { google } = require('googleapis');
const UserProfile = require('../models/UserProfile');
const refresh = require('passport-oauth2-refresh');
const graph = require('../graph.js');

function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, data: profile});
}

router.post('/createfilesharingsnapshot', (req, res) => {
    if(!req.user) return res.status(500).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const fileDataList = [];
        if(userProfile.user.driveType === "microsoft") {
            // Make sure to refresh tokens before attempting to access Microsoft Graph API
            refresh.requestNewAccessToken(
                'microsoft',
                userProfile.user.tokens.refresh_token,
                function (err, accessToken, refreshToken) {
                    // Store new tokens in database
                    userProfile.user.tokens.access_token = accessToken;
                    userProfile.user.tokens.refresh_token = refreshToken;
                    userProfile.save();
                },
            );

            const accessToken = userProfile.user.tokens.access_token;

            // Call Microsoft Graph API method to get all file permission data and metadata
            const driveItems = await graph.getDriveItems(accessToken);
            await Promise.all(driveItems.value.map(async (driveItem) => {
                let metadata = driveItem;

                // Gets the permissions for a particular driveItem and adds it to the metadata
                await graph.getDriveItemPermissions(accessToken, metadata.id).then(permissions => {
                    metadata['permissions'] = permissions;
                    fileDataList.push(metadata);
                });
            }));
            
        }
        else if(userProfile.user.driveType === "google") {
            // Make sure to refresh tokens before attempting to access Google Drive API
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
            const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET, process.env.CLIENT_URL);
            
            oAuth2Client.setCredentials(userProfile.user.tokens);
            // Create Google Drive object to call API
            const googleDrive = google.drive({
                version: 'v3',
                auth: oAuth2Client
            });

            // Call Google Drive API method to get all file permission data and metadata
            let NextPageToken = "";
            do {
                const params = {
                    pageToken: NextPageToken || ""
                };
                const response1 = await googleDrive.files.list(params);
                if(!response1) return res.status(500).json({success: false, message: "Error"});
                const files = response1.data.files;
                // Get file metadata and permissions
                files.map((file) => {
                    googleDrive.files.get({fileId: file.id, fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime, parents, permissions"}, (err, response2) => {
                        if(err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: "Error"});
                        }
                        let metadata = response2.data;
                        fileDataList.push(metadata);
                    });
                });
                NextPageToken = response1.data.nextPageToken;
            } while(NextPageToken);
        }

        // Create new file sharing snapshot to store in user profile
        fileDataList.map((data) => console.log(data));
        console.log("Creating file-sharing snapshot");
        const defaultName = "fs_snapshot";
        const snapshotNumber = userProfile.fileSharingSnapshots.length + 1;
        const currentDate = new Date();
        const snapshot = {
            name: defaultName + snapshotNumber,
            createdAt: currentDate,
            updatedAt: currentDate,
            data: fileDataList
        };
        userProfile.fileSharingSnapshots.push(snapshot);
        // Save to database
        userProfile.save();

        const profile = JSON.parse(JSON.stringify(userProfile));
        // No need to send token data to front-end
        profile.user.tokens = undefined;
        return res.status(200).json({success: true, data: profile});
    });
});

module.exports = router;