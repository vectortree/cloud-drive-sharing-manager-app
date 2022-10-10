const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for User Profile
const UserProfileSchema = new Schema({
    // User
    user: {
        type: Object,
        required: true
    },
    // List of file-sharing snapshots
    fileSharingSnapshots: {
        type: [{
            name: String,
            createdAt: Date,
            updatedAt: Date,
            data: [{
                Permission: Object,
                Metadata: Object
            }]
        }],
        required: false
    },
    // List of group-membership snapshots
    groupMembershipSnapshots: {
        type: [{
            name: String,
            createdAt: Date,
            updatedAt: Date,
            data: [{
                Group: Object
            }]
        }],
        required: false
    },
    // List of access control requirements
    accessControlRequirements: {
        type: [{
            name: String,
            searchQuery: [{
                operator: String,
                argument: String
            }],
            allowedReaders: [String],
            allowedWriters: [String],
            deniedReaders: [String],
            deniedWriters: [String]
        }],
        required: false
    },
    // List of search queries
    searchQueryHistory: {
        type: [[{
            operator: String,
            argument: String
        }]],
        required: false
    }
});

// Create model for UserProfile
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfile;