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
  getTasks,
  getMembers,
} = require("../services/analytics.service");
const { generatePDFReport } = require("../utils/pdfGenerator.util");
const onTimeCompletion = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getOnTimeCompletion(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get on-time completion" });
  }
};
const taskDistribution = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTaskDistribution(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task distribution" });
  }
};
const pointsByMember = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsByMember(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points by member" });
  }
};
const TasksByStatus = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTasksByStatus(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks by status" });
  }
};
const pointsEarnedOverTime = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsEarnedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points earned over time" });
  }
};
const createdOverTime = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getCreatedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get created over time" });
  }
};
const memberPreformance = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getMemberPerformance(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get member performance" });
  }
};

const reports = async (req, res) => {
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
};
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
