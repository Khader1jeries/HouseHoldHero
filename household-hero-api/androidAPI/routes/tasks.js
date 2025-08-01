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
module.exports = router;
