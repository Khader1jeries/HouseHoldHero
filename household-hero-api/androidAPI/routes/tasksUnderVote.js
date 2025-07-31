const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const { calculateScore } = require("../../webApi/controllers/scoreController");
router.get("/android/TwoVotes/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }
  console.log("called");
  try {
    const memberSnapshot = await db.collection("members").doc(assignedTo).get();

    if (!memberSnapshot.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    const memberData = memberSnapshot.data();
    const adminEmail = memberData.adminEmail;
    const now = new Date().toISOString();
    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();
    const filteredTasks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.dueDate > now); // task is now a plain object

    const tasksPromises = filteredTasks.map(async (task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        adminEmail: task.adminEmail,
        createdAt: task.createdAt,
        startDate: task.startDate,
        dueDate: task.dueDate,
        score: await calculateScore(assignedTo, task.id),
        yes: task.yes || [],
        no: task.no || [],
      };
    });

    const tasks = await Promise.all(tasksPromises);

    // Shuffle and return 2 random tasks
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const randomTwo = shuffled.slice(0, 2);

    return res.status(200).json(randomTwo);
  } catch (error) {
    console.error("Error getting vote tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
