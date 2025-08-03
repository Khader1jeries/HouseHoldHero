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
module.exports = {
  onTimeCompletion,
};
