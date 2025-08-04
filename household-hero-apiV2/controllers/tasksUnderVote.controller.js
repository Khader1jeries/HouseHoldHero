const admin = require("firebase-admin");
const db = admin.firestore();

const {
  calculateScoreForTasksUnderVote,
  calculateWithHungarianAlgorithm,
} = require("../services/score.service");
const { expired, addToAdmin } = require("../services/tasksUnderVote.service");
const { activeTasks, addTaskToMember } = require("../services/tasks.service");
const {
  validateCreateTaskUnderVote,
} = require("../validations/tasksUnderVote.validation");
const { createTask } = require("./tasks.controller");
const createTaskUnderVote = async (req, res) => {
  try {
    const task = req.body;

    const validation = validateCreateTaskUnderVote(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
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
};
const getTaskUnderVoteByID = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const taskDoc = await db.collection("tasksUnderVote").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ id: taskDoc.id, ...taskDoc.data() });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getRandom2TasksUnderVote = async (req, res) => {
  const { adminEmail } = req.params;

  try {
    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // return empty array if no matching tasks
    }

    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Shuffle and take two random tasks
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    res.status(200).json(selected);
  } catch (error) {
    console.error("❌ Error fetching voting tasks:", error);
    res.status(500).json({ error: "Failed to fetch voting tasks" });
  }
};
const getTasksUnderVoteIfActive = async (req, res) => {
  try {
    const { adminEmail } = req.params;

    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "No tasks under vote found for this admin" });
    }

    const tasks = [];

    for (const doc of snapshot.docs) {
      const task = { id: doc.id, ...doc.data() };

      await expired(task);

      if (task.expired === false) {
        tasks.push(task);
      }
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching active tasks under vote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getTasksUnderVoteIfExpired = async (req, res) => {
  try {
    const { adminEmail } = req.params;

    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "No tasks under vote found for this admin" });
    }

    const tasks = [];

    for (const doc of snapshot.docs) {
      const task = { id: doc.id, ...doc.data() };

      await expired(task);

      if (task.expired === true) {
        tasks.push(task);
      }
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching active tasks under vote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const moveToTask = async (req, res) => {
  try {
    const { id } = req.params;
    const additionalData = req.body;

    // Required fields from body
    const requiredFields = ["startDate", "dueDate", "assignedTo"];

    for (const field of requiredFields) {
      if (!additionalData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Get task from tasksUnderVote
    const voteTaskRef = db.collection("tasksUnderVote").doc(id);
    const voteTaskDoc = await voteTaskRef.get();

    if (!voteTaskDoc.exists) {
      return res.status(404).json({ error: "Task under vote not found" });
    }

    const voteTaskData = voteTaskDoc.data();

    // Merge fields from vote task and user-provided fields
    const task = {
      createdAt: new Date().toISOString(),
      description: voteTaskData.description,

      /* dates */
      dueDate: additionalData.dueDate,
      startDate: additionalData.startDate,

      /* metadata */
      priority: voteTaskData.priority,
      title: voteTaskData.title,
      adminEmail: voteTaskData.adminEmail,
      assignedTo: additionalData.assignedTo,

      /* remaining fields */
      score: 0,
      subtasks: voteTaskData.subtasks,
    };

    // Calculate score using both assignedTo and the task ID
    const score = await calculateScoreForTasksUnderVote(task.assignedTo, id);
    task.score = score;

    // Subtask count and default setup
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

    let pointsDivided = count === 0 ? 0 : task.score / count;

    Object.keys(task.subtasks).forEach((subtaskId) => {
      const subtask = task.subtasks[subtaskId];
      subtask.status =
        typeof subtask.status === "boolean" ? subtask.status : false;
      subtask.score = pointsDivided; // Force set every time
    });
    task.status = false;

    // Add to main tasks
    const newTaskRef = await createTask(task);

    // Get the user by email (your unique key)
    const userRef = db.collection("users").doc(task.adminEmail); // using email as the document ID
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    // Remove the task ID from tasksUnderVote array
    await userRef.update({
      tasksUnderVote: admin.firestore.FieldValue.arrayRemove(id),
    });

    // Delete from vote tasks
    await voteTaskRef.delete();

    res.status(201).json({
      success: true,
      message: "Task moved successfully",
      id: newTaskRef.id,
      ...task,
    });
  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({ error: "Failed to move task" });
  }
};
module.exports = {
  createTaskUnderVote,
  getTaskUnderVoteByID,
  getRandom2TasksUnderVote,
  getTasksUnderVoteIfActive,
  getTasksUnderVoteIfExpired,
  moveToTask,
};
