const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Group = require('./Group');

 // Create schema for GroupMembershipSnapshot
const GroupMembershipSnapshot = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId
        ref: 'Group'
    }]
 }, { timestamps: true });

 const GroupMembershipSnapshot = mongoose.model('GroupMembershipSnapshot', GroupMembershipSnapshotSchema);

 module.exports = { GroupMembershipSnapshot };