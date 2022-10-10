const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');
const Permission = require('./Permission');
const File = require('./File');
const Group = require('./Group');
const FileSharingSnapshot = require('./FileSharingSnapshot');
const GroupMembershipSnapshot = require('./GroupMembershipSnapshot');
const AccessControlRequirement = require('./AccessControlRequirement');
const SearchQuery = require('./SearchQuery');



// Create schema for User Profile
const UserProfileSchema = new Schema({
    // User
    user: {
        type: mongoose.ObjectId,
        ref: 'User'
    },
    // List of file-sharing snapshots
    fileSharingSnapshots: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'FileSharingSnapshot'
        }],
        required: false
    },
    // List of group-membership snapshots
    groupMembershipSnapshots: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'GroupMembershipSnapshot'
        }],
        required: false
    },
    // List of access control requirements
    accessControlRequirements: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'AccessControlRequirement'
        }],
        required: false
    },
    // List of search queries
    searchQueryHistory: {
        type: [{
            type: mongoose.ObjectId,
            ref: 'SearchQuery'
        }],
        required: false
    }
});

// Create model for UserProfile
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = { UserProfile };