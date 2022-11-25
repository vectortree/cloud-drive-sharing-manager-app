// All necessary back-end operations (e.g., CRUD) for access control requirements will be written here
// Note that there's no need for the client to "GET" an access control requirement
// since the client will be able to access all the access control requirements in the user profile

// For editing and deleting an access control requirement, note that the "id" is the array index,
// which can be sufficiently obtained and sent by the client using the array of access control requirements
// in the user profile
const router = require("express").Router();
const UserProfile = require('../models/UserProfile');

async function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

router.post('/createaccesscontrolrequirement', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);
    console.log(req.body);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const {
            id,
            name,
            searchQuery,
            group,
            allowedReaders,
            allowedWriters,
            deniedReaders,
            deniedWriters } = req.body;
        
        // Check that the provided search query non-null
        //if(!searchQuery || !group) return res.status(400).json({success: false, message: "Invalid data format"});
        if(!searchQuery) return res.status(400).json({success: false, message: "Invalid data format"});

        // Access control sets must not be null
        // Any empty access control set should be an empty list
        // This should be enforced in the front-end
        if(!allowedReaders || !allowedWriters || !deniedReaders || !deniedWriters)
            return res.status(400).json({success: false, message: "Invalid data format"});
        
        // Must have at least one nonempty access control set (e.g., AR, AW, DR, DW)
        if(allowedReaders.length == 0 && allowedWriters.length == 0 && deniedReaders.length == 0 && deniedWriters.length == 0) {
            console.log("All access control sets are empty");
            return res.status(400).json({success: false, message: "Must specify least one nonempty access control set"});
        }

        // Check that there are no contradictions in the access control requirement
        // The following pairs of sets must not have a nonempty intersection:
        // (AR, DR), (AW, DR), (AW, DW)

        let intersection1 = allowedReaders.filter(x => deniedReaders.includes(x));
        let intersection2 = allowedWriters.filter(x => deniedReaders.includes(x));
        let intersection3 = allowedWriters.filter(x => deniedWriters.includes(x));

        if(intersection1.length > 0 || intersection2.length > 0 || intersection3.length > 0) {
            console.log("Contradiction detected");
            return res.status(400).json({success: false, message: "The following pairs of sets must be disjoint:\nAllowed Readers and Denied Readers\nAllowed Writers and Denied Readers\nAllowed Writers and Denied Writers"});
        }
        // Note: An access control set must be a list (of Strings)

        // Note: The front-end will validate the search query before making a request to this endpoint
        // so that a valid search query is always sent to the server

        console.log("Creating access control requirement");
        const defaultName = "ac_requirement";
        const requirementNumber = userProfile.accessControlRequirements.length + 1;
        // Create a default name
        let requirementName = defaultName + requirementNumber;
        // If name specified, replace requirementName with user-specified name
        if(name && name.trim() !== "") requirementName = name;
        // Create an access control requirement object
        let currentDate = new Date();
        let accessControlRequirement = {
            id: parseInt(id),
            name: requirementName,
            searchQuery: searchQuery,
            group: group,
            allowedReaders: allowedReaders.map((s) => s.toLowerCase()),
            allowedWriters: allowedWriters.map((s) => s.toLowerCase()),
            deniedReaders: deniedReaders.map((s) => s.toLowerCase()),
            deniedWriters: deniedWriters.map((s) => s.toLowerCase()),
            createdAt: currentDate,
            updatedAt: currentDate
        };
        // Store access control requirement in user profile
        userProfile.accessControlRequirements.push(accessControlRequirement);
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

router.delete('/removeaccesscontrolrequirement/:id', async (req, res) => {
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.accessControlRequirements.length) {
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        //}
        let index = userProfile.accessControlRequirements
                    .findIndex(r => r.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        console.log("Deleting access control requirement " + req.params.id);
        // Delete access control requirement in user profile
        userProfile.accessControlRequirements.splice(index, 1);
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

router.put('/editaccesscontrolrequirement/:id', async (req, res) => {
    // Note: This is pretty much the same as creating an access control requirement,
    // except that it replaces the selected access control requirement with a new one
    // based on the new form values
    if(!req.user) return res.status(401).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const {
            name,
            searchQuery,
            group,
            allowedReaders,
            allowedWriters,
            deniedReaders,
            deniedWriters } = req.body;

        // Check that the provided search query is non-null
        if(!searchQuery) return res.status(400).json({success: false, message: "Invalid data format"});

        // Access control sets must not be null
        // Any empty access control set should be an empty list
        // This should be enforced in the front-end
        if(!allowedReaders || !allowedWriters || !deniedReaders || !deniedWriters)
            return res.status(400).json({success: false, message: "Invalid data format"});
        
        if(allowedReaders.length == 0 && allowedWriters.length == 0 && deniedReaders.length == 0 && deniedWriters.length == 0) {
            console.log("All access control sets are empty");
            return res.status(400).json({success: false, message: "Must specify least one nonempty access control set"});
        }

        // Check that there are no contradictions in the access control requirement
        // The following pairs of sets must not have a nonempty intersection:
        // (AR, DR), (AW, DR), (AW, DW)

        let intersection1 = allowedReaders.filter(x => deniedReaders.includes(x));
        let intersection2 = allowedWriters.filter(x => deniedReaders.includes(x));
        let intersection3 = allowedWriters.filter(x => deniedWriters.includes(x));

        if(intersection1.length > 0 || intersection2.length > 0 || intersection3.length > 0) {
            console.log("Contradiction detected");
            return res.status(400).json({success: false, message: "The following pairs of sets must be disjoint:\nAllowed Readers and Denied Readers\nAllowed Writers and Denied Readers\nAllowed Writers and Denied Writers"});
        }
        
        // Check that provided index is valid
        //if(req.params.id < 0 || req.params.id >= userProfile.accessControlRequirements.length) {
            //return res.status(400).json({success: false, message: "Index out of bounds"});
        //}
        // Note: An access control set must be a list (of Strings)

        // Note: The front-end will validate the search query before making a request to this endpoint
        // so that a valid search query is always sent to the server

        // Set requirementName to the old name
        let index = userProfile.accessControlRequirements
                    .findIndex(r => r.id == parseInt(req.params.id));
        if(index == -1) return res.status(400).json({success: false, message: "Invalid ID"});
        let requirementName = userProfile.accessControlRequirements[index].name;
        // If name is non-null and name is not the empty string, then set requirementName to the new name
        if(name && name.trim() !== "") requirementName = name;
        // Create an access control requirement object
        // Note: The createdAt field will remain the same (since we're editing)
        console.log("Editing access control requirement");
        let currentDate = new Date();
        let accessControlRequirement = {
            id: userProfile.accessControlRequirements[index].id,
            name: requirementName,
            searchQuery: searchQuery,
            group: group,
            allowedReaders: allowedReaders.map((s) => s.toLowerCase()),
            allowedWriters: allowedWriters.map((s) => s.toLowerCase()),
            deniedReaders: deniedReaders.map((s) => s.toLowerCase()),
            deniedWriters: deniedWriters.map((s) => s.toLowerCase()),
            createdAt: userProfile.accessControlRequirements[index].createdAt,
            updatedAt: currentDate
        };
        // Replace access control requirement in user profile
        userProfile.accessControlRequirements[index] = accessControlRequirement;
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

module.exports = router;