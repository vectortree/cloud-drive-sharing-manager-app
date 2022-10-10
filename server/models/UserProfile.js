const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for User
const UserSchema = new Schema({
    givenName: String,
    familyName: String,
    email: String,
    picture: String
 }, { timestamps: true });

  // Create schema for Permission
  const Permission = new Schema({
    permissionType: String,
    role: String,
    email: String,
    domain: String
});

 // Create schema for FileData
 const FileData = new Schema({

 });

  // Create schema for GroupData
  const GroupData = new Schema({

});

 // Create schema for FileSharingSnapshot
const FileSharingSnapshot = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId
        ref: 'FileData'
    }]
 }, { timestamps: true });

 // Create schema for GroupMembershipSnapshot
const GroupMembershipSnapshot = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId
        ref: 'GroupData'
    }]
 }, { timestamps: true });

  // Create schema for AccessControlRequirement
const AccessControlRequirement = new Schema({
    name: String,
    searchQuery: {
        type: mongoose.ObjectId
        ref: 'SearchQuery'
    },
    aR: [],
    aW: [],
    dR: [],
    dW: []
 }, { timestamps: true });

// Create schema for User Profile
const UserProfileSchema = new Schema({
    // user
    user: {
        type: mongoose.ObjectId
        ref: 'User'
    },
    // List of file-sharing snapshots
    fileSharingSnapshots: {
        type: [{
            type: mongoose.ObjectId
            ref: 'FileSharingSnapshot'
        }],
        required: false
    },
    // List of group-membership snapshots
    groupMembershipSnapshots: {
        type: [{
            type: mongoose.ObjectId
            ref: 'GroupMembershipSnapshot'
        }],
        required: false
    },
    // List of access control requirements
    accessControlRequirements: {
        type: [{
            type: mongoose.ObjectId
            ref: 'AccessControlRequirement'
        }],
        required: false
    }
    // List of search queries
    SearchQueryHistory: {
        type: [{
            type: mongoose.ObjectId
            ref: 'SearchQuery'
        }],
        required: false
    }
});

// Create models
const User = mongoose.model('User', UserSchema);
const Permission = mongoose.model('Permission', PermissionSchema);
const FileData = mongoose.model('FileData', FileDataSchema);
const GroupData = mongoose.model('GroupData', GroupDataSchema);
const FileSharingSnapshot = mongoose.model('FileSharingSnapshot', FileSharingSnapshotSchema);
const GroupMembershipSnapshot = mongoose.model('GroupMembershipSnapshot', GroupMembershipSnapshotSchema);
const AccessControlRequirement = mongoose.model('AccessControlRequirement', AccessControlRequirementSchema);
const SearchQuery = mongoose.model('SearchQuery', SearchQuerySchema);
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = {User, Permission, FileData, GroupData, FileSharingSnapshot, GroupMembershipSnapshot, AccessControlRequirement, SearchQuery, UserProfile};