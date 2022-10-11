const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserProfile = require('../models/UserProfile');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // On successful authentication, find or create user profile in database
    console.log(profile);
    UserProfile.findOne({ 'user.data.sub': profile.id }, async function(err, userProfile) {
        if(!userProfile) {
            //Create new user profile
            console.log("Creating new user profile");
            const newUserProfile = new UserProfile({
                user: { driveType: "google", data: profile._json },
                fileSharingSnapshots: [],
                groupMembershipSnapshots: [],
                accessControlRequirements: [],
                searchQueryHistory: []
            });
            await newUserProfile.save();
            cb(null, newUserProfile);
        }
        else {
            console.log("User profile already exists");
            cb(null, userProfile);
        }
    });
  }
));

passport.serializeUser((profile, done) => {
    done(null, profile._id);
});

passport.deserializeUser((id, done) => {
    UserProfile.findById(id, (err, userProfile) => {
        done(null, userProfile);
    });
});