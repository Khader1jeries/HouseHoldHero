// server.js - Updated to include all routes
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./config/firebase");



// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Setup error handling for Firebase operations
app.use((req, res, next) => {
  req.firestore = db;
  next();
});
const usersRoutes = require("./routes/users.routes");
const membersRoutes = require("./routes/members.routes");
const tasksRoutes = require("./routes/tasks.routes");
const tasksUnderVoteRoutes = require("./routes/tasksUnderVote.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const messagesRoutes = require("./routes/messages.routes");
app.use("/api/users", usersRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/tasksUnderVote", tasksUnderVoteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messagesRoutes);
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
