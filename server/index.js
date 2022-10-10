const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const UserProfile = require('./models/UserProfile');

require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true}));
app.use(session({
    name: "session",
    secret: "session secret",
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        uri: process.env.ATLAS_URI,
        ttl: 60 * 60 * 24
    }),
    cookie: {maxAge: 60 * 60 * 24 * 1000 }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((profile, done) => {
    done(null, profile._id);
});

passport.deserializeUser((id, done) => {
    UserProfile.findById(id, (err, userProfile) => {
        done(null, userProfile);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // On successful authentication, find or create user profile in database
    console.log(profile);
    UserProfile.findOne({ 'user.sub': profile.id }, async function(err, userProfile) {
        if(!userProfile) {
            //Create new user profile
            console.log("Creating new user profile");
            const newUserProfile = new UserProfile({
                user: profile._json,
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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: process.env.CLIENT_URL, failureRedirect: 'auth/google' }));

app.get('/getuser', (req, res) => {
    console.log("Get user: " + req.user);
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    if(req.user) {
        req.logout(function(err) {
            if(err) return next(err);
        });
        res.send("Logged out");
    }
});
  
app.listen(port, () => {
    // Perform a database connection when server starts
    mongoose
    .connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log(err));
    console.log(`Server is running on port: ${port}`);
});