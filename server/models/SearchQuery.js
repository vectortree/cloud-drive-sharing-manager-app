const mongoose = require('mongoose');
const Schema = mongoose.Schema;
  
  // Create schema for SearchQuery
  const SearchQuerySchema = new Schema({
    expressions: [{
        operator: String,
        argument: String
    }]
 });

 const SearchQuery = mongoose.model('SearchQuery', SearchQuerySchema);

 module.exports = { SearchQuery };