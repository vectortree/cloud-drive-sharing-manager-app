// All necessary back-end operations (e.g., CRUD) for the user's search query history will be written here
// Note that there's no need for the client to "GET" the user's search query history
// since the client will be able to access it in the user profile

const router = require("express").Router();
const UserProfile = require('../models/UserProfile');

async function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

router.post('/addsearchquery', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);

    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { id, searchQuery } = req.body;

        if(!searchQuery) return res.status(400).json({success: false, message: "Invalid data format"});

        console.log("Adding query to search query history");
        let sizeLimit = 50;
        if(userProfile.searchQueryHistory.length == sizeLimit)
            userProfile.searchQueryHistory.shift();
        userProfile.searchQueryHistory.push({
            id: parseInt(id),
            searchQuery: searchQuery
        });
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

router.delete('/clearsearchqueries', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});

        console.log("Clearing all search queries from history");
        userProfile.searchQueryHistory = [];
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

router.delete('/removesearchquery/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});

        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.searchQueryHistory.length) {
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        //}
        let index = userProfile.searchQueryHistory
                    .findIndex(q => q.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        // Delete search query from history
        userProfile.searchQueryHistory.splice(index, 1);
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