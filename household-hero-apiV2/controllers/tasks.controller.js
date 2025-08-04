const admin = require("firebase-admin");
const db = admin.firestore();
const { addTaskToMember, activeTasks } = require("../services/tasks.service");
const { validateCreateTask } = require("../validations/tasks.valdation");
const createTask = async (req, res) => {
  try {
    const task = req.body;

    const validation = validateCreateTask(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
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
    task.scoreGained = 0;
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
};
module.exports = { createTask };
