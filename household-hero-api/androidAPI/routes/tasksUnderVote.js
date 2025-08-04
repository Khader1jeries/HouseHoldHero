const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
router.get("/android/TwoVotes/:adminEmail/:assignedTo", async (req, res) => {
  const { adminEmail, assignedTo } = req.params;

  if (!adminEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }
  console.log("called");
  try {
    const now = new Date().toISOString();
    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();
    const filteredTasks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.dueDate > now); // task is now a plain object

    const tasksPromises = filteredTasks.map(async (task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        adminEmail: task.adminEmail,
        createdAt: task.createdAt,
        startDate: task.startDate,
        dueDate: task.dueDate,

        yes: task.yes || [],
        no: task.no || [],
      };
    });

    const tasks = await Promise.all(tasksPromises);

    // Shuffle and return 2 random tasks
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const randomTwo = shuffled.slice(0, 2);

    return res.status(200).json(randomTwo);
  } catch (error) {
    console.error("Error getting vote tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/android/AllVotes/:adminEmail/", async (req, res) => {
  const { adminEmail } = req.params;

  if (!adminEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Missing assignedTo parameter" });
  }
  console.log("called");
  try {
    const now = new Date().toISOString();
    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();
    const filteredTasks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((task) => task.dueDate > now); // task is now a plain object

    const tasksPromises = filteredTasks.map(async (task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        adminEmail: task.adminEmail,
        createdAt: task.createdAt,
        startDate: task.startDate,
        dueDate: task.dueDate,
        yes: task.yes || [],
        no: task.no || [],
      };
    });

    const tasks = await Promise.all(tasksPromises);

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting vote tasks:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/android/subtasks/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
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
router.put("/android/updateVote/:taskId/:vote/:email", async (req, res) => {
  const { taskId, vote, email } = req.params;

  try {
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const taskData = taskDoc.data();

    // Get current yes/no arrays (default to empty if missing)
    const yesArray = taskData.yes || [];
    const noArray = taskData.no || [];

    let updatedYes = yesArray;
    let updatedNo = noArray;

    if (vote === "yes") {
      if (yesArray.includes(email)) {
        return res
          .status(200)
          .json({ success: false, message: "Already voted YES" });
      }

      // Remove from no array if present
      if (noArray.includes(email)) {
        updatedNo = noArray.filter((e) => e !== email);
        console.log(`User ${email} changed vote from NO to YES`);
      }

      // Add to yes array
      updatedYes = [...yesArray, email];
    } else if (vote === "no") {
      if (noArray.includes(email)) {
        return res
          .status(200)
          .json({ success: false, message: "Already voted NO" });
      }

      // Remove from yes array if present
      if (yesArray.includes(email)) {
        updatedYes = yesArray.filter((e) => e !== email);
        console.log(`User ${email} changed vote from YES to NO`);
      }

      // Add to no array
      updatedNo = [...noArray, email];
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vote type" });
    }

    // Update Firestore document
    await taskRef.update({
      yes: updatedYes,
      no: updatedNo,
    });

    return res
      .status(200)
      .json({ success: true, message: "Vote updated successfully" });
  } catch (error) {
    console.error("Error updating vote:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
router.put("/android/addComment/:taskId/:email", async (req, res) => {
  const { taskId, email } = req.params;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Comment is required" });
  }

  try {
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Use Firestore field path notation to update a single key inside the "comments" map
    const commentFieldPath = `comments.${email}`;

    await taskRef.update({
      [commentFieldPath]: comment,
    });

    return res
      .status(200)
      .json({ success: true, message: "Comment added/updated" });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
