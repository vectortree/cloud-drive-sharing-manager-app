
const router = require("express").Router();
const passport = require("passport");

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata'], accessType: 'offline', prompt: 'consent' }));

router.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: process.env.CLIENT_URL, failureRedirect: '/auth/google' }));

router.get('/auth/microsoft',

passport.authenticate('microsoft', { scope: ['user.read'], accessType: 'offline', prompt: 'select_account'}));

router.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', { successRedirect: process.env.CLIENT_URL, failureRedirect: '/auth/microsoft' }));

router.get('/getuser', (req, res) => {
    if(req.user) {
      let userProfile = JSON.parse(JSON.stringify(req.user));
      // No need to send token data to front-end
      userProfile.user.tokens = undefined;
      res.send(userProfile);
    }
    else res.send(null);
});

router.get('/logout', (req, res) => {
    if(req.user) {
        req.logout(function(err) {
            if(err) return next(err);
        });
        res.status(200).json({success: true});
    }
});

module.exports = router;