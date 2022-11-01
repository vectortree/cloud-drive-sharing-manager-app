const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserProfile = require('../models/UserProfile');
const refresh = require('passport-oauth2-refresh');

const strategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, otherTokenDetails, profile, cb) {
    // On successful authentication, save tokens and find or create user profile in database
    console.log(profile);
    let tokens = {
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: otherTokenDetails.scope,
        token_type: otherTokenDetails.token_type,
        expiry_date: otherTokenDetails.expires_in
    };
    UserProfile.findOne({ 'user.data.sub': profile.id }, async function(err, userProfile) {
        if(!userProfile) {
            //Create new user profile
            console.log("Creating new user profile");
            const newUserProfile = new UserProfile({
                user: { driveType: "google", data: profile._json, tokens: tokens},
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
);

passport.use(strategy);
refresh.use(strategy);

passport.serializeUser((profile, done) => {
    done(null, profile._id);
});

passport.deserializeUser((id, done) => {
    UserProfile.findById(id, (err, userProfile) => {
        done(null, userProfile);
    });
});