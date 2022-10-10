const mongoose = require('mongoose');
const Schema = mongoose.Schema;
  
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

 const AccessControlRequirement = mongoose.model('AccessControlRequirement', AccessControlRequirementSchema);

 module.exports = { AccessControlRequirement };