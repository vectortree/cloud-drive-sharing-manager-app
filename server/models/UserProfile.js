const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    // User
    user: {
        type: {
            driveType: {type: String, enum: ['google', 'microsoft']},
            data: Object,
            tokens: Object
        },
        required: true

    },
    // List of file-sharing snapshots
    fileSharingSnapshots: {
        type: [{
            id: Number,
            name: String,
            createdAt: Date,
            updatedAt: Date,
            data: [Object]
        }],
        required: false
    },
    // List of group-membership snapshots
    groupMembershipSnapshots: {
        type: [{
            id: Number,
            name: String,
            groupName: String,
            groupAddress: String,
            timestamp: Date,
            createdAt: Date,
            updatedAt: Date,
            members: [String]
        }],
        required: false
    },
    // List of access control requirements
    accessControlRequirements: {
        type: [{
            id: Number,
            name: String,
            searchQuery: Object,
            group: Boolean,
            allowedReaders: [String],
            allowedWriters: [String],
            deniedReaders: [String],
            deniedWriters: [String],
            createdAt: Date,
            updatedAt: Date
        }],
        required: false
    },
    // List of search queries (serialized as objects)
    searchQueryHistory: {
        type: [{
            id: Number,
            searchQuery: Object
        }],
        required: false
    },
    // Log of all sharing changes performed by the system
    sharingChangesLog: {
        type: [{
            files: [Object],
            permissionType: String,
            permissionRole: String,
            permissionValue: String,
            timestamp: Date,
            action: {type: String, enum: ['add', 'remove', 'unshare']}
        }],
        required: false
    }
});

// Create model for UserProfile
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfile;