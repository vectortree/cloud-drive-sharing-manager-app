const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
 // Create schema for FileSharingSnapshot
const FileSharingSnapshot = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId
        ref: 'FileData'
    }]
 }, { timestamps: true });

 const FileSharingSnapshot = mongoose.model('FileSharingSnapshot', FileSharingSnapshotSchema);

 module.exports = { FileSharingSnapshot };