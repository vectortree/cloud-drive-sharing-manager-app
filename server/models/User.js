const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for User
const UserSchema = new Schema({
    givenName: String,
    familyName: String,
    email: String,
    picture: String
 }, { timestamps: true });

 const User = mongoose.model('User', UserSchema);

 module.exports = { User };