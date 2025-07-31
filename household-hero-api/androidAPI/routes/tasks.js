const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
//get all by adminEmail
router.get("/android/", async (req, res) => {
  try {
    const { assignedTo } = req.query;

    if (!assignedTo) {
      return res.status(400).json({ error: "member email is required" });
    }

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .get();

    const tasks = [];
    snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
module.exports = router;
