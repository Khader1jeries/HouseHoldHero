const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const { addTaskToMember } = require("../../controllers/memberController");
// Create a new task
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
      "assignedTo",
      "score",
    ];

    for (const field of requiredFields) {
      if (!task[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Set default status for subtasks if present
    if (task.subtasks && typeof task.subtasks === "object") {
      Object.keys(task.subtasks).forEach((subtaskId) => {
        const subtask = task.subtasks[subtaskId];
        if (typeof subtask.status !== "boolean") subtask.status = false;
        if (typeof subtask.score !== "number") subtask.score = 0;
      });
    }

    const docRef = await db.collection("tasks").add(task);
    await addTaskToMember(task.assignedTo, docRef.id);
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

//update
router.put("/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const updatedData = req.body;

    await db.collection("tasks").doc(taskId).update(updatedData);

    res
      .status(200)
      .json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
});

router.delete("/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    await db.collection("tasks").doc(taskId).delete();
    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
});

//get all by adminEmail
router.get("/", async (req, res) => {
  try {
    const { adminEmail } = req.query;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    const snapshot = await db
      .collection("tasks")
      .where("adminEmail", "==", adminEmail)
      .get();

    const tasks = [];
    snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

//by assignedTo and adminEmail
router.get("/filter", async (req, res) => {
  try {
    const { adminEmail, assignedTo } = req.query;

    if (!adminEmail || !assignedTo) {
      return res
        .status(400)
        .json({ error: "adminEmail and assignedTo are required" });
    }

    const snapshot = await db
      .collection("tasks")
      .where("adminEmail", "==", adminEmail)
      .where("assignedTo", "==", assignedTo)
      .get();

    const tasks = [];
    snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error filtering tasks:", error);
    res.status(500).json({ error: "Failed to filter tasks" });
  }
});

module.exports = router;
