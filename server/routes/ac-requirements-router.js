// All necessary back-end operations (e.g., CRUD) for access control requirements will be written here
// Note that there's no need for the client to "GET" an access control requirement
// since the client will be able to access all the access control requirements in the user profile

// For editing and deleting an access control requirement, note that the "id" is the array index,
// which can be sufficiently obtained and sent by the client using the array of access control requirements
// in the user profile
const router = require("express").Router();
const UserProfile = require('../models/UserProfile');

function sendUserProfile(res, userProfile) {
    // Make a copy of user profile object before sending to client
    const profile = JSON.parse(JSON.stringify(userProfile));
    // No need to send token data to front-end
    profile.user.tokens = undefined;
    return res.status(200).json({success: true, profile: profile});
}

router.post('/createaccesscontrolrequirement', (req, res) => {
    if(!req.user) return res.status(500).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { 
            name,
            searchQuery,
            allowedReaders,
            allowedWriters,
            deniedReaders,
            deniedWriters } = req.body;

        // Must have at least one access control set (e.g., AR, AW, DR, DW)
        // This should be enforced in the UI
        if(!allowedReaders && !allowedWriters && !deniedReaders && !deniedWriters)
            return res.status(401).json({success: false, message: "Invalid data format"});
        
        // Note: An access control set must be a list (of Strings)

        // Note: Need to check for valid search query
        // A valid search query should be a list of operator:argument objects (can be an empty list)
        // This can be done in the client side (e.g., using the query builder UI)
        // so that a valid search query is always sent to the server

        // Check that the provided search query is non-null
        if(!searchQuery) return res.status(401).json({success: false, message: "Invalid data format"});

        console.log("Creating access control requirement");
        const defaultName = "ac_requirement";
        const requirementNumber = userProfile.accessControlRequirements.length + 1;
        // Create a default name
        let requirementName = defaultName + requirementNumber;
        // If name specified, replace requirementName with user-specified name
        if(name && name !== "") requirementName = name;
        // Create an access control requirement object
        let currentDate = new Date();
        let accessControlRequirement = {
            name: requirementName,
            searchQuery: searchQuery,
            allowedReaders: allowedReaders,
            allowedWriters: allowedWriters,
            deniedReaders: deniedReaders,
            deniedWriters: deniedWriters,
            createdAt: currentDate,
            updatedAt: currentDate
        };
        // Store access control requirement in user profile
        userProfile.accessControlRequirements.push(accessControlRequirement);
        // Save to database
        userProfile.save();
        return sendUserProfile(res, userProfile);
    });
});

router.delete('/removeaccesscontrolrequirement/:id', (req, res) => {
    if(!req.user) return res.status(500).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        // Check that provided index is valid
        if(req.params.id < 0 || req.params.id >= userProfile.accessControlRequirements.length) {
            return res.status(401).json({success: false, message: "Index out of bounds"});
        }
        // Delete access control requirement in user profile
        userProfile.accessControlRequirements.splice(req.params.id, 1);
        // Save changes to database
        userProfile.save();
        return sendUserProfile(res, userProfile);
    });
});

router.put('/editaccesscontrolrequirement/:id', (req, res) => {
    // Note: This is pretty much the same as creating an access control requirement,
    // except that it replaces the selected access control requirement with a new one
    // based on the new form values
    if(!req.user) return res.status(500).json({success: false, message: "Error"});
    console.log(req.user);
    UserProfile.findById(req.user._id, async (err, userProfile) => {
        if(err) console.log(err);
        if(err || !userProfile) return res.status(500).json({success: false, message: "Error"});
        const { 
            name,
            searchQuery,
            allowedReaders,
            allowedWriters,
            deniedReaders,
            deniedWriters } = req.body;


        // Must have at least one access control set (e.g., AR, AW, DR, DW)
        // This should be enforced in the UI
        if(!allowedReaders && !allowedWriters && !deniedReaders && !deniedWriters)
            return res.status(401).json({success: false, message: "Invalid data format"});
        
        // Check that provided index is valid
        if(req.params.id < 0 || req.params.id >= userProfile.accessControlRequirements.length) {
            return res.status(401).json({success: false, message: "Index out of bounds"});
        }
        // Note: An access control set must be a list (of Strings)

        // Note: Need to check for valid search query
        // A valid search query should be a list of operator:argument objects (can be an empty list)
        // This can be done in the client side (e.g., using the query builder UI)
        // so that a valid search query is always sent to the server

        // Check that the provided search query is non-null
        if(!searchQuery) return res.status(401).json({success: false, message: "Invalid data format"});
        // Set requirementName to the old name
        let requirementName = userProfile.accessControlRequirements[req.params.id].name;
        // If name is non-null and name is not the empty string, then set requirementName to the new name
        if(name && name !== "") requirementName = name;
        // Create an access control requirement object
        // Note: The createdAt field will remain the same (since we're editing)
        let currentDate = new Date();
        let accessControlRequirement = {
            name: requirementName,
            searchQuery: searchQuery,
            allowedReaders: allowedReaders,
            allowedWriters: allowedWriters,
            deniedReaders: deniedReaders,
            deniedWriters: deniedWriters,
            createdAt: userProfile.accessControlRequirements[req.params.id].createdAt,
            updatedAt: currentDate
        };
        // Replace access control requirement in user profile
        userProfile.accessControlRequirements[req.params.id] = accessControlRequirement;
        // Save to database
        userProfile.save();
        return sendUserProfile(res, userProfile);
    });
});

module.exports = router;