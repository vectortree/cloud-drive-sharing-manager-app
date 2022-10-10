const mongoose = require('mongoose');
const Schema = mongoose.Schema;

 // Create schema for Permission
  const Permission = new Schema({
    permissionType: String,
    role: String,
    email: String,
    domain: String
});

const Permission = mongoose.model('Permission', PermissionSchema);

module.exports = { Permission };