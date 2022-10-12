const router = require("express").Router();
const { google } = require('googleapis');
const UserProfile = require('../models/UserProfile');

router.post('/createfilesharingsnapshot', (req, res) => {
    if(!req.user) return res.status(500).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) throw err;
        if(!userProfile) return res.status(500).json({success: false, message: "Error"});
        if(userProfile.user.driveType == "microsoft") {
            // TODO
        }
        else if(userProfile.user.driveType == "google") {
            const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET, process.env.CLIENT_URL);
            
            oAuth2Client.setCredentials(userProfile.user.tokens);
            // Create Google Drive object to call API
            const googleDrive = google.drive({
                version: 'v3',
                auth: oAuth2Client
            });

            // Call Google Drive API method to get all file permission data and metadata
            const fileDataList = [];
            let NextPageToken = "";
            do {
                const params = {
                    pageToken: NextPageToken || ""
                };
                const response1 = await googleDrive.files.list(params);
                const files = response1.data.files;
                // Get file metadata and permissions
                files.map((file) => {
                    googleDrive.files.get({fileId: file.id, fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime, parents, permissions"}, (err, response2) => {
                        if(err) {
                            console.log(err);
                            return response2.status(500).json({success: false, message: "Error"});
                        }
                        let metadata = response2.data;
                        fileDataList.push(metadata);
                    });
                });
                NextPageToken = response1.data.nextPageToken;
            } while(NextPageToken);

            // Create new file sharing snapshot to store in user profile
            // fileDataList.map((data) => console.log(data));
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
        }
        // No need to send token data to front-end
        userProfile.user.tokens = undefined;
        return res.status(200).json({success: true, data: userProfile});
    });
});

module.exports = router;