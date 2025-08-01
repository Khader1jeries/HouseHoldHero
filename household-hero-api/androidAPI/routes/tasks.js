const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
//get all by adminEmail
router.get("/android/:assignedTo", async (req, res) => {
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
});

router.get("/android/TwoActive/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/TwoFuture/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/TwoFinished/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/AllActive/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/AllFinished/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/AllFuture/:assignedTo", async (req, res) => {
  const { assignedTo } = req.params;

  if (!assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }

  try {
    console.log(assignedTo);
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
});
router.get("/android/subtasks/:taskId", async (req, res) => {
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
});
router.put("/android/subtasks/complete/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const subtasksArray = req.body.subtasks;

    if (!Array.isArray(subtasksArray)) {
      return res.status(400).json({
        success: false,
        message: "'subtasks' must be an array",
      });
    }
    let count = 0;
    // Convert array to object where each item uses its `id` as the key
    const subtasksObject = {};
    for (const subtask of subtasksArray) {
      if (!subtask.id) continue; // Skip if no ID
      subtasksObject[subtask.id] = {
        score: subtask.score,
        status: subtask.status,
      };
      if (subtask.status) count++;
    }
    await db
      .collection("tasks")
      .doc(taskId)
      .update({
        status: count === subtasksArray.length,
      });
    await db.collection("tasks").doc(taskId).update({
      subtasks: subtasksObject,
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
});

module.exports = router;
