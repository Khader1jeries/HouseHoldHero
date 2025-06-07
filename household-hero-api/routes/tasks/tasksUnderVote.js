const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const {
  expired,
  addToAdmin,
} = require("../../controllers/tasksUnderVoteController");
router.post("/", async (req, res) => {
  try {
    const task = req.body;

    // Basic validation
    const requiredFields = [
      "createdAt",
      "description",
      "dueDate",
      "startDate",
      "priority",
      "title",
      "adminEmail",
    ];

    for (const field of requiredFields) {
      if (!task[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    if (task.subtasks && typeof task.subtasks === "object") {
      // Set default status for subtasks if present
      Object.keys(task.subtasks).forEach((subtaskId) => {
        const subtask = task.subtasks[subtaskId];
        if (typeof subtask.status !== "boolean") subtask.status = false;
        if (typeof subtask.score !== "number") subtask.score = 0;
      });
    } else {
      task.subtasks = {
        [task.title]: {
          score: 0,
          status: false,
        },
      };
    }
    const status = false;
    task.status = status;
    const completionRate = 0;
    task.completionRate = completionRate;
    task.yes = [];
    task.no = [];
    await expired(task);

    const docRef = await db.collection("tasksUnderVote").add(task);
    await addToAdmin(task, docRef.id);
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      id: docRef.id,
      ...task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});
module.exports = router;
