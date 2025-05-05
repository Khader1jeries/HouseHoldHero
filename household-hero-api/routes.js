// routes.js - Define all API routes
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// ===== MEMBERS ROUTES =====

// Get all members
router.get("/members", async (req, res) => {
  try {
    const membersSnapshot = await db.collection("members").get();
    const members = [];

    membersSnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting members:", error);
    res.status(500).json({ error: "Failed to retrieve members" });
  }
});

// Get member by ID
router.get("/members/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({
      id: memberDoc.id,
      ...memberDoc.data(),
    });
  } catch (error) {
    console.error("Error getting member:", error);
    res.status(500).json({ error: "Failed to retrieve member" });
  }
});

// Create new member
router.post("/members", async (req, res) => {
  try {
    const newMember = req.body;

    // Validate required fields
    if (!newMember.name || !newMember.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Add creation timestamp
    newMember.createdAt = admin.firestore.FieldValue.serverTimestamp();

    const docRef = await db.collection("members").add(newMember);

    res.status(201).json({
      id: docRef.id,
      ...newMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});

// Update member
router.put("/members/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const updatedData = req.body;

    // Add update timestamp
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection("members").doc(memberId).update(updatedData);

    res.status(200).json({
      id: memberId,
      ...updatedData,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// Delete member
router.delete("/members/:id", async (req, res) => {
  try {
    const memberId = req.params.id;

    await db.collection("members").doc(memberId).delete();

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// ===== TASKS ROUTES =====

// Get all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasksSnapshot = await db.collection("tasks").get();
    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get tasks by status
router.get("/tasks/status/:status", async (req, res) => {
  try {
    const status = req.params.status;
    const tasksSnapshot = await db
      .collection("tasks")
      .where("status", "==", status)
      .get();

    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks by status:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get task by ID
router.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskDoc = await db.collection("tasks").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({
      id: taskDoc.id,
      ...taskDoc.data(),
    });
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).json({ error: "Failed to retrieve task" });
  }
});

// Create new task
router.post("/tasks", async (req, res) => {
  try {
    const newTask = req.body;

    // Validate required fields
    if (!newTask.title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    // Add creation timestamp
    newTask.createdAt = admin.firestore.FieldValue.serverTimestamp();

    // Convert date strings to Firestore timestamps
    if (newTask.dueDate) {
      newTask.dueDate = new Date(newTask.dueDate);
    }

    if (newTask.startDate) {
      newTask.startDate = new Date(newTask.startDate);
    }

    const docRef = await db.collection("tasks").add(newTask);

    res.status(201).json({
      id: docRef.id,
      ...newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task
router.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;

    // Add update timestamp
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Convert date strings to Firestore timestamps if present
    if (updatedData.dueDate) {
      updatedData.dueDate = new Date(updatedData.dueDate);
    }

    if (updatedData.startDate) {
      updatedData.startDate = new Date(updatedData.startDate);
    }

    if (updatedData.completionDate) {
      updatedData.completionDate = new Date(updatedData.completionDate);
    }

    await db.collection("tasks").doc(taskId).update(updatedData);

    res.status(200).json({
      id: taskId,
      ...updatedData,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    await db.collection("tasks").doc(taskId).delete();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Add a comment to a task
router.post("/tasks/:id/comments", async (req, res) => {
  try {
    const taskId = req.params.id;
    const comment = req.body;

    // Validate
    if (!comment.content || !comment.author) {
      return res.status(400).json({ error: "Content and author are required" });
    }

    // Add timestamp
    comment.timestamp = admin.firestore.FieldValue.serverTimestamp();

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Use array union to add to comments array
    await taskRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(comment),
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ===== LEADERBOARD ROUTES =====

// Get leaderboard (members sorted by score)
router.get("/leaderboard", async (req, res) => {
  try {
    const period = req.query.period || "month"; // Default to monthly

    const membersSnapshot = await db
      .collection("members")
      .orderBy("score", "desc")
      .get();

    const leaderboard = [];
    let position = 1;

    membersSnapshot.forEach((doc) => {
      leaderboard.push({
        position,
        id: doc.id,
        ...doc.data(),
      });
      position++;
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

// Get tasks assigned to a specific member
router.get("/members/:id/tasks", async (req, res) => {
  try {
    const memberId = req.params.id;
    const tasksSnapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", memberId)
      .get();

    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting member tasks:", error);
    res.status(500).json({ error: "Failed to retrieve member tasks" });
  }
});

module.exports = router;
