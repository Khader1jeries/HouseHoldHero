// server.js - Updated to include all routes
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin BEFORE requiring routes
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Make Firebase accessible globally
const db = admin.firestore();

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Setup error handling for Firebase operations
app.use((req, res, next) => {
  req.firestore = admin.firestore();
  next();
});

// Import routes AFTER Firebase is initialized
const userRoutes = require("./routes/users");
const memberRoutes = require("./members"); // Import the members module
const taskRoutes = require("./tasks"); // Import the tasks module

// Set up our API routes

app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes); // Use the members routes
app.use("/api/tasks", taskRoutes); // Use the tasks routes

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Household Hero API is running");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: `Server error: ${err.message || "Unknown error"}`,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
