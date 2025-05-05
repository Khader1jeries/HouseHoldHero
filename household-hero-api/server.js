// server.js - Main entry point for our API
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin BEFORE requiring routes
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// IMPORTANT: Only require routes AFTER Firebase is initialized
const routes = require("./routes");

// Set up our API routes
app.use("/api", routes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Household Hero API is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
