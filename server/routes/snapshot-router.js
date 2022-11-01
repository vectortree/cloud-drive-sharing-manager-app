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

async function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

// TODO: Remove global variable from back-end router
let fileDataList = [];

async function getDriveItems(accessToken, path) {
    const driveItems = await graph.getDriveItemsPath(accessToken, path);
    await Promise.all(driveItems.value.map(async (driveItem) => {
        let metadata = driveItem;

        // Gets the permissions for a particular driveItem and adds it to the metadata
        await graph.getDriveItemPermissions(accessToken, metadata.id).then(async (permissions) => {
            metadata['permissions'] = permissions;
            fileDataList.push(metadata);
            if (metadata.folder && metadata.folder.childCount > 0) {
                let p = metadata.parentReference.path + '/' + metadata.name + ':';
                await getDriveItems(accessToken, p);
            }
        });
    }));
}

router.post('/createfilesharingsnapshot', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
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
                        userProfile.save();
                    },
                );
            }

            const accessToken = userProfile.user.tokens.access_token;

            // Call Microsoft Graph API method recursively to get all file permission data and metadata
            await getDriveItems(accessToken, '/drive/root');
            
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
                    googleDrive.files.get({fileId: file.id, fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime, parents, sharingUser, owners, lastModifyingUser, permissions"}, (err, response2) => {
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
        // Create a default name
        let snapshotName = defaultName + snapshotNumber;
        // If name specified, replace snapshotName with user-specified name
        if(req.body.name) snapshotName = req.body.name;
        const currentDate = new Date();
        const snapshot = {
            name: snapshotName,
            createdAt: currentDate,
            updatedAt: currentDate,
            data: fileDataList
        };
        userProfile.fileSharingSnapshots.push(snapshot);
        // Save to database
        userProfile.save();
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
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(userProfile.user.driveType !== "google")
            return res.status(401).json({success: false, message: "Invalid drive type"});

        const {
            name,
            groupName,
            groupAddress,
            timestamp,
            htmlFile } = req.body;

        // Group name, group email address, and HTML file must be specified
        if(!groupName || !groupAddress || !htmlFile)
            return res.status(401).json({success: false, message: "Invalid data format"});
        
        // TODO: Validate HTML file
        // The system should only be able to scrape the membership of a group if the user has
        // permission to see the email addresses of the group members

        // Extract group membership information from the HTML file and store it in an array
        let membersList = [];

        // Load the HTML markup using cheerio.load
        const $ = cheerio.load(htmlFile);

        const members = $('a[href^="mailto:"]');

        if(!members.length) return res.status(401).json({success: false, message: "Invalid HTML file"});

        members.each((index, element) => membersList.push($(element).attr("href").replace("mailto:", "")));

        // Create group-membership snapshot
        console.log("Creating group-membership snapshot");
        const defaultName = "gm_snapshot";
        const snapshotNumber = userProfile.groupMembershipSnapshots.length + 1;
        // Create a default name
        let snapshotName = defaultName + snapshotNumber;
        // If name specified, replace snapshotName with user-specified name
        if(name) snapshotName = name;

        // This is for timestamp fields related to the snapshot itself
        let currentDate = new Date();
        // If timestamp not specified by user, use an approximate timestamp
        let stamp = currentDate;
        if(timestamp) stamp = timestamp;

        const snapshot = {
            name: snapshotName,
            groupName: groupName,
            groupAddress: groupAddress,
            timestamp: stamp,
            createdAt: currentDate,
            updatedAt: currentDate,
            members: membersList
        };
    
        userProfile.groupMembershipSnapshots.push(snapshot);
        // Save to database
        userProfile.save();
        return sendUserProfile(res, userProfile);
    });
});

module.exports = router;