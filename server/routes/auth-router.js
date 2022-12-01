
const router = require("express").Router();
const passport = require("passport");

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata'], accessType: 'offline', prompt: 'consent'}));

router.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: process.env.CLIENT_URL, failureRedirect: '/auth/google' }));

router.get('/auth/microsoft',
passport.authenticate('microsoft', { scope: ['user.read', 'files.readwrite.all', 'sites.read.all'], accessType: 'offline', prompt: 'consent'}));

router.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', { successRedirect: process.env.CLIENT_URL, failureRedirect: '/auth/microsoft' }));

router.get('/getuserprofile', async (req, res) => {
    if(req.user) {
      // Make a copy of user profile object before sending to client
      let userProfile = JSON.parse(JSON.stringify(req.user));
      // No need to send token data to front-end
      userProfile.user.tokens = undefined;
      return res.status(200).json({success: true, profile: userProfile});
    }
    return res.status(401).json({success: false, profile: null});
});

router.get('/logout', async (req, res) => {
    
    if(req.user) {
        req.logout(function(err) {
            if(err) return next(err);
        });
        return res.status(200).json({success: true, message: "Logged out"});
    }
    else return res.status(401).json({success: false, message: "Logout failed"});
});

module.exports = router;