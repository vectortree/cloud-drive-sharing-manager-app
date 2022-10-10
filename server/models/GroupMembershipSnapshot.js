const mongoose = require('mongoose');
const Schema = mongoose.Schema;

 // Create schema for GroupMembershipSnapshot
const GroupMembershipSnapshot = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId
        ref: 'GroupData'
    }]
 }, { timestamps: true });

 const GroupMembershipSnapshot = mongoose.model('GroupMembershipSnapshot', GroupMembershipSnapshotSchema);

 module.exports = { GroupMembershipSnapshot };