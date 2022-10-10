const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const File = require('./File');
 
 // Create schema for FileSharingSnapshot
const FileSharingSnapshotSchema = new Schema({
    name: String,
    data: [{
        type: mongoose.ObjectId,
        ref: 'File'
    }]
 }, { timestamps: true });

 const FileSharingSnapshot = mongoose.model('FileSharingSnapshot', FileSharingSnapshotSchema);

 module.exports = { FileSharingSnapshot };