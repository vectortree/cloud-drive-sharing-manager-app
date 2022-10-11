const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
require("dotenv").config();
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const app = express();
require('./passport/passport-google');
require('./passport/passport-microsoft');

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true}));

app.use(session({
    name: "session",
    secret: "session secret",
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        uri: process.env.ATLAS_URI,
        ttl: 60 * 60 * 24
    }),
    cookie: { maxAge: 60 * 60 * 24 * 1000 }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes/auth"));
  
app.listen(port, () => {
    // Perform a database connection when server starts
    mongoose
    .connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log(err));
    console.log(`Server is running on port: ${port}`);
});