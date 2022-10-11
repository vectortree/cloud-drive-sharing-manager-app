const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const UserProfile = require('../models/UserProfile');

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET_VALUE,
    callbackURL: "/auth/microsoft/callback",
    tenant: 'stonybrook.edu'
  },
  function(accessToken, refreshToken, profile, cb) {
    // On successful authentication, find or create user profile in database
    console.log(profile);
    UserProfile.findOne({ 'user.data.sub': profile.id }, async function(err, userProfile) {
        if(!userProfile) {
            //Create new user profile
            console.log("Creating new user profile");
            const newUserProfile = new UserProfile({
                user: { driveType: "microsoft", data: profile._json },
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