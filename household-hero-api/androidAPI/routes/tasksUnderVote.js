const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
router.get("/android/TwoVotes/:adminEmail/:assignedTo", async (req, res) => {
  const { adminEmail, assignedTo } = req.params;

  if (!adminEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }
  console.log("called");
  try {
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
router.get("/android/AllVotes/:adminEmail/:assignedTo", async (req, res) => {
  const { adminEmail, assignedTo } = req.params;

  if (!adminEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }
  console.log("called");
  try {
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
        yes: task.yes || [],
        no: task.no || [],
      };
    });

    const tasks = await Promise.all(tasksPromises);

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting vote tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/android/subtasks/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) return res.status(404).json({ success: false });

    const taskData = taskSnap.data();
    const subtasksObject = taskData.subtasks || {};

    const subtasks = Object.entries(subtasksObject).map(([id, data]) => ({
      id,
      ...data,
    }));

    return res.status(200).json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subtasks",
    });
  }
});
module.exports = router;
