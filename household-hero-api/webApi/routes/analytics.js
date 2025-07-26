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
router.get("/reports/:adminEmail", async (req, res) => {
  const { adminEmail } = req.params;

  try {
    // Fetch all data in parallel
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

    // Set PDF response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${adminEmail}_analytics_report.pdf"`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // PDF Content
    doc
      .fontSize(20)
      .text("📊 HouseHoldHero Analytics Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Admin: ${adminEmail}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown().moveDown();

    // On-time Completion
    doc.fontSize(16).text(`✅ On-Time Completion Rate: ${onTimeCompletion}%`);
    doc.moveDown();

    // Task Distribution Score
    doc.text(`🧮 Task Distribution Balance Score: ${taskDistribution}%`);
    doc.moveDown();

    // Tasks by Status
    doc.text("📌 Tasks by Status:");
    Object.entries(tasksByStatus).forEach(([status, count]) => {
      doc.text(`• ${status}: ${count}`);
    });
    doc.moveDown();

    // Points by Member
    doc.text("🏅 Points by Member:");
    Object.entries(pointsByMember).forEach(([name, points]) => {
      doc.text(`• ${name}: ${points} pts`);
    });
    doc.moveDown();

    // Points Over Time
    doc.text("📈 Points Earned Over Last 6 Months:");
    Object.entries(pointsOverTime).forEach(([month, score]) => {
      doc.text(`• ${month}: ${score} pts`);
    });
    doc.moveDown();

    // Tasks Created Over Time
    doc.text("📝 Tasks Created Over Last 6 Months:");
    Object.entries(createdOverTime).forEach(([month, count]) => {
      doc.text(`• ${month}: ${count} tasks`);
    });
    doc.moveDown();

    // Member Performance Table
    doc.fontSize(16).text("👥 Member Performance:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    memberPerformance.forEach((m, i) => {
      doc.text(
        `${i + 1}. ${m.fullName} — Completed Tasks: ${
          m.completedTasks
        }, Score: ${m.score}, Completion Rate: ${m.completionRate}%`
      );
    });

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err.stack || err);
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
});

module.exports = router;
