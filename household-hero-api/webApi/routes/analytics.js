const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();
const {
  getOnTimeCompletion,
  getTaskDistribution,
  getPointsByMember,
  getTasksByStatus,
  getPointsEarnedOverTime,
  getCreatedOverTime,
  getMemberPerformance,
  getMembers, // ← ADD THIS LINE
  getTasks, // ← ADD THIS LINE
} = require("../controllers/analyticsController");

// GET /analytics/on-time-completion/:adminEmail
router.get("/on-time-completion/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getOnTimeCompletion(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get on-time completion" });
  }
});

// GET /analytics/task-distribution/:adminEmail
router.get("/task-distribution/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTaskDistribution(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task distribution" });
  }
});

// GET /analytics/points-by-member/:adminEmail
router.get("/points-by-member/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsByMember(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points by member" });
  }
});

// GET /analytics/tasks-by-status/:adminEmail
router.get("/tasks-by-status/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTasksByStatus(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks by status" });
  }
});

// GET /analytics/points-earned-over-time/:adminEmail
router.get("/points-earned-over-time/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsEarnedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points earned over time" });
  }
});

// GET /analytics/created-over-time/:adminEmail
router.get("/created-over-time/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getCreatedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get created over time" });
  }
});

// GET /analytics/member-performance/:adminEmail
router.get("/member-performance/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getMemberPerformance(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get member performance" });
  }
});

// Updated route handler
router.get("/reports/:adminEmail", async (req, res) => {
  const { adminEmail } = req.params;

  try {
    // Fetch all data in parallel (your existing code)
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

    // Prepare data for PDF generation
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

    // Generate PDF
    const pdfBuffer = await generatePDFReport(reportData);

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="team-report-${Date.now()}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating report:", err.stack || err);
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
});

module.exports = router;
