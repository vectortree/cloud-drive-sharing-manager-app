const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const { OAuth2Client } = require('google-auth-library');

app.use(cors());
app.use(express.json());


require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5001;

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage',
);

app.post('/auth/google', async (req, res) => {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // Exchange code for tokens
    console.log(tokens);
    res.json(tokens);
});
  
app.post('/auth/google/refresh-token', async (req, res) => {
    const user = new UserRefreshClient(
        clientId,
        clientSecret,
        req.body.refreshToken,
    );
    const { credentials } = await user.refreshAccessToken(); // Optain new tokens
    res.json(credentials);
});
  
app.listen(port, () => {
    // Perform a database connection when server starts
    mongoose
    .connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log(err));
    console.log(`Server is running on port: ${port}`);
});