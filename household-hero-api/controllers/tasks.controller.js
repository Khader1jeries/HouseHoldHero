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

    const docRef = await db.collection("tasks").add(task);

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
const getAllMemberTasks = async (req, res) => {
  try {
    const { assignedTo } = req.params;

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
};
const getRandom2ActiveTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .get();

    const activeTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (
        task.startDate &&
        task.dueDate &&
        now >= task.startDate &&
        now <= task.dueDate
      ) {
        activeTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(activeTasks.slice(0, 2));
  } catch (error) {
    console.error("Error getting active tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const getRandom2FutureTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .get();

    const futureTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (task.startDate && now < task.startDate) {
        futureTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(futureTasks.slice(0, 2));
  } catch (error) {
    console.error("Error getting future tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const getRandom2FinishedTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .limit(10)
      .get();

    const finishedTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (task.dueDate && now > task.dueDate) {
        finishedTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(finishedTasks.slice(0, 2));
  } catch (error) {
    console.error("Error getting Finished tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const allActiveTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .get();

    const activeTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (
        task.startDate &&
        task.dueDate &&
        now >= task.startDate &&
        now <= task.dueDate
      ) {
        activeTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(activeTasks);
  } catch (error) {
    console.error("Error getting active tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const allFinishedTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .get();

    const finishedTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (task.dueDate && now > task.dueDate) {
        finishedTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(finishedTasks);
  } catch (error) {
    console.error("Error getting Finished tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const allFutureTasksForMember = async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    const now = new Date().toISOString();

    const snapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", assignedTo)
      .orderBy("startDate")
      .get();

    const futureTasks = [];

    snapshot.forEach((doc) => {
      const task = doc.data();

      if (task.startDate && now < task.startDate) {
        futureTasks.push({ id: doc.id, ...task });
      }
    });

    return res.status(200).json(futureTasks);
  } catch (error) {
    console.error("Error getting future tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const getSubTasks = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const taskRef = db.collection("tasks").doc(taskId);
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
};
const markSubtaskAsComplete = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const subtasksArray = req.body.subtasks;

    if (!Array.isArray(subtasksArray)) {
      return res.status(400).json({
        success: false,
        message: "'subtasks' must be an array",
      });
    }
    let scoreGained = 0;
    let count = 0;
    // Convert array to object where each item uses its `id` as the key
    const subtasksObject = {};
    for (const subtask of subtasksArray) {
      if (!subtask.id) continue; // Skip if no ID
      subtasksObject[subtask.id] = {
        score: subtask.score,
        status: subtask.status,
      };
      if (subtask.status) {
        scoreGained += subtask.score;
        count++;
      }
    }
    await db
      .collection("tasks")
      .doc(taskId)
      .update({
        status: count === subtasksArray.length,
      });
    await db.collection("tasks").doc(taskId).update({
      subtasks: subtasksObject,
      scoreGained: scoreGained,
    });

    return res.status(200).json({
      success: true,
      message: "Subtasks updated successfully",
    });
  } catch (error) {
    console.error("Error updating subtasks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  createTask,
  getAllTasksRelatedToUser,
  getTaskByID,
  getRandom2Tasks,
  deleteTask,
  getRandom2ActiveTasksForMember,
  getAllMemberTasks,
  getRandom2FutureTasksForMember,
  getRandom2FinishedTasksForMember,
  allActiveTasksForMember,
  allFinishedTasksForMember,
  allFutureTasksForMember,
  getSubTasks,
  markSubtaskAsComplete,
};
