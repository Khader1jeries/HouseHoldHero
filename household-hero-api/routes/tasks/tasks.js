const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const {
  addTaskToMember,
  activeTasks,
} = require("../../controllers/memberController");

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
      if (task[field] === undefined || task[field] === null) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    let count = 0;
    if (task.subtasks && typeof task.subtasks === "object") {
      Object.keys(task.subtasks).forEach((subtaskId) => {
        count++;
      });
    } else {
      task.subtasks = {
        [task.title]: {
          score: task.score,
          status: false,
        },
      };
      count = 1;
    }
    let pointsDivided;
    if (count == 0) pointsDivided = 0;
    else pointsDivided = task.score / count;
    if (task.subtasks && typeof task.subtasks === "object") {
      // Set default status for subtasks if present
      Object.keys(task.subtasks).forEach((subtaskId) => {
        const subtask = task.subtasks[subtaskId];
        if (typeof subtask.status !== "boolean") subtask.status = false;
        if (typeof subtask.score !== "number") subtask.score = pointsDivided;
      });
    }
    const status = false;
    task.status = status;
    const completionRate = 0;
    task.completionRate = completionRate;
    console.log("📤 Adding task to Firestore...");
    const docRef = await db.collection("tasks").add(task);
    console.log("✅ Task added with ID:", docRef.id);
    await addTaskToMember(task.assignedTo, docRef.id);
    await activeTasks(task.assignedTo);
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Get the task
    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskData = taskDoc.data();
    const memberEmail = taskData.assignedTo;

    if (!memberEmail) {
      return res
        .status(400)
        .json({ error: "Task is missing assignedTo field" });
    }

    // Step 2: Remove task ID from member's tasks array
    const memberRef = db.collection("members").doc(memberEmail);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Assigned member not found" });
    }

    await memberRef.update({
      tasks: admin.firestore.FieldValue.arrayRemove(id),
    });

    // Step 3: Delete the task
    await taskRef.delete();

    res
      .status(200)
      .json({ message: "Task deleted and reference removed from member" });
  } catch (error) {
    console.error("Error deleting task and updating member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
