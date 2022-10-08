const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());


require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

app.listen(port, () => {
    // Perform a database connection when server starts
    mongoose
    .connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => console.log(err));
    console.log(`Server is running on port: ${port}`);
});