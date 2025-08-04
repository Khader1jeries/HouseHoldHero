const admin = require("firebase-admin");
const db = admin.firestore();
const { addTaskToMember, activeTasks } = require("../services/tasks.service");
const { validateCreateTask } = require("../validations/tasks.valdation");
const { calculateScore } = require("../services/score.service");
const createTask = async (req, res) => {
  try {
    const task = req.body;
    const validation = validateCreateTask(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }
    if (task.score === 0) {
      task.score = await calculateScore(task.assignedTo);
    }
    let count = 0;
    if (task.subtasks && typeof task.subtasks === "object") {
      count = Object.keys(task.subtasks).length;
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
const getAllTasksRelatedToUser = async (req, res) => {
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
};
const getTaskByID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const taskRef = db.collection("tasks").doc(id); //
    const taskDoc = await taskRef.get();
    console.log(taskDoc);
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ id: taskDoc.id, ...taskDoc.data() });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};
const getRandom2Tasks = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const now = new Date();

    if (!adminEmail) {
      return res.status(400).json({ error: "Admin email is required." });
    }

    const tasksSnapshot = await db
      .collection("tasks")
      .where("adminEmail", "==", adminEmail)
      .get();

    const filteredTasks = [];

    tasksSnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };

      const startDate = task.startDate?.toDate?.() || new Date(task.startDate);
      const dueDate = task.dueDate?.toDate?.() || new Date(task.dueDate);

      if (startDate <= now && dueDate >= now) {
        filteredTasks.push(task);
      }
    });

    // Return empty array if no tasks match
    if (filteredTasks.length === 0) {
      return res.status(200).json([]);
    }

    // Shuffle and pick 2 random tasks
    const shuffled = filteredTasks.sort(() => 0.5 - Math.random());
    const twoTasks = shuffled.slice(0, 2);

    res.status(200).json(twoTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const deleteTask = async (req, res) => {
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

    if (memberDoc.exists) {
      await memberRef.update({
        tasks: admin.firestore.FieldValue.arrayRemove(id),
      });
    }
    // Step 3: Delete the task
    await taskRef.delete();

    res
      .status(200)
      .json({ message: "Task deleted and reference removed from member" });
  } catch (error) {
    console.error("Error deleting task and updating member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  createTask,
  getAllTasksRelatedToUser,
  getTaskByID,
  getRandom2Tasks,
  deleteTask,
};
