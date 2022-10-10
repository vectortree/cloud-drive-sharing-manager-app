const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for File
const FileSchema = new Schema({

});

const File = mongoose.model('File', FileSchema);

module.exports = { File };