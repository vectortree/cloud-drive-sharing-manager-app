const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for Group
const GroupData = new Schema({

});

const Group = mongoose.model('Group', GroupSchema);

module.exports = { Group };