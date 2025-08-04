// -----------------------------------------------------------------------------
// Analytics Controller
// -----------------------------------------------------------------------------
//  ‣ Provides Express route handlers for analytics endpoints.
//  ‣ Each handler pulls the admin’s email from `req.params`, calls a corresponding
//    service-layer helper, and returns JSON (or a PDF for `reports`).
//  ‣ **Important:** This file only handles HTTP transport-level concerns;
//    the heavy lifting (data aggregation / Firestore queries / PDF generation)
//    lives in the service and util layers.
// -----------------------------------------------------------------------------

const admin = require("firebase-admin"); // Firebase Admin SDK
const db = admin.firestore(); // Firestore instance (unused here but
// handy if you need direct access)

// ───────────────────────────────────────────────────────────────────────────────
// Service-layer helpers (pure data logic, no HTTP concerns)
// ───────────────────────────────────────────────────────────────────────────────
const {
  getOnTimeCompletion, // % of tasks finished on/before due date
  getTaskDistribution, // tasks grouped by category / priority, etc.
  getPointsByMember, // total points per team member
  getTasksByStatus, // count of tasks by status (todo / done / …)
  getPointsEarnedOverTime, // points trend (e.g., per week)
  getCreatedOverTime, // tasks created over time
  getMemberPerformance, // composite KPI per member
  getTasks, // raw tasks list
  getMembers, // raw members list
} = require("../services/analytics.service");

const { generatePDFReport } = require("../utils/pdfGenerator.util"); // PDF helper

// ───────────────────────────────────────────────────────────────────────────────
// Basic JSON endpoints
// ───────────────────────────────────────────────────────────────────────────────

// % of tasks completed on time
const onTimeCompletion = async (req, res) => {
  try {
    const { adminEmail } = req.params; // path param :adminEmail
    const result = await getOnTimeCompletion(adminEmail);
    res.json(result); // 200 OK with JSON payload
  } catch (error) {
    res.status(500).json({ error: "Failed to get on-time completion" });
  }
};

// Distribution of tasks across categories / priorities
const taskDistribution = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTaskDistribution(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task distribution" });
  }
};

// Points leaderboard
const pointsByMember = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsByMember(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points by member" });
  }
};

// Task counts by status (Todo / In-Progress / Done / …)
const TasksByStatus = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTasksByStatus(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks by status" });
  }
};

// Points trend over time (e.g., line chart data)
const pointsEarnedOverTime = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsEarnedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points earned over time" });
  }
};

// Tasks created trend over time
const createdOverTime = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getCreatedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get created over time" });
  }
};

// Composite KPI per member (accuracy, timeliness, etc.)
const memberPreformance = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getMemberPerformance(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get member performance" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// PDF Report endpoint
// ───────────────────────────────────────────────────────────────────────────────
//  Generates a consolidated PDF with all analytics in one document.
//  Steps:
//   1. Fetch all datasets in parallel via Promise.all.
//   2. Shape them into a `reportData` object.
//   3. Pass that to `generatePDFReport`, which returns a Buffer.
//   4. Stream the Buffer back with proper PDF headers.
// ───────────────────────────────────────────────────────────────────────────────
const reports = async (req, res) => {
  const { adminEmail } = req.params;

  try {
    // Fetch all analytics; Promise.all maximizes concurrency
    const [
      members,
      tasks,
      onTimeCompletion,
      taskDistribution,
      pointsByMember,
      tasksByStatus,
      pointsOverTime,
      createdOverTime,
      memberPerformance,
    ] = await Promise.all([
      getMembers(adminEmail),
      getTasks(adminEmail),
      getOnTimeCompletion(adminEmail),
      getTaskDistribution(adminEmail),
      getPointsByMember(adminEmail),
      getTasksByStatus(adminEmail),
      getPointsEarnedOverTime(adminEmail),
      getCreatedOverTime(adminEmail),
      getMemberPerformance(adminEmail),
    ]);

    // Aggregate everything for the PDF generator
    const reportData = {
      adminEmail,
      onTimeCompletion,
      taskDistribution,
      pointsByMember,
      tasksByStatus,
      pointsOverTime,
      createdOverTime,
      memberPerformance,
      membersCount: members.length,
      tasksCount: tasks.length,
    };

    const pdfBuffer = await generatePDFReport(reportData); // Returns Buffer

    // Static headers so browsers treat it as a downloadable PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="team-report-${Date.now()}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Stream the PDF to the client
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating report:", err.stack || err);
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Exports (CommonJS)
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  onTimeCompletion,
  taskDistribution,
  pointsByMember,
  TasksByStatus,
  pointsEarnedOverTime,
  createdOverTime,
  memberPreformance,
  reports,
};
