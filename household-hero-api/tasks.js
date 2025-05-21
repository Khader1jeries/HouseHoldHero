// tasks.js - Handle all task-related functionality
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// Helper functions
// Format task data for consistent responses
const formatTaskData = (id, data) => {
  // Convert Firestore timestamps to regular Date objects
  const formattedData = { ...data };

  // Handle date fields (make sure they're proper JavaScript dates)
  ["dueDate", "startDate", "completionDate", "createdDate"].forEach((field) => {
    if (formattedData[field] && formattedData[field]._seconds) {
      formattedData[field] = new Date(formattedData[field]._seconds * 1000);
    }
  });

  // Format timestamps in comments if present
  if (formattedData.comments && Array.isArray(formattedData.comments)) {
    formattedData.comments = formattedData.comments.map((comment) => {
      if (comment.timestamp && comment.timestamp._seconds) {
        return {
          ...comment,
          timestamp: new Date(comment.timestamp._seconds * 1000),
        };
      }
      return comment;
    });
  }

  return {
    id,
    ...formattedData,
  };
};

// ===== TASK ROUTES =====

// Get all tasks with optional filtering by familyId
router.get("/", async (req, res) => {
  try {
    const { familyId, assignedTo, status } = req.query;
    let query = db.collection("tasks");

    // Apply filters if provided
    if (familyId) {
      query = query.where("familyId", "==", familyId);
    }

    if (assignedTo) {
      query = query.where("assignedTo", "==", assignedTo);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    const tasksSnapshot = await query.get();
    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push(formatTaskData(doc.id, doc.data()));
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get tasks by status
router.get("/status/:status", async (req, res) => {
  try {
    const status = req.params.status;
    const { familyId } = req.query;

    let query = db.collection("tasks").where("status", "==", status);

    // Add familyId filter if provided
    if (familyId) {
      query = query.where("familyId", "==", familyId);
    }

    const tasksSnapshot = await query.get();
    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push(formatTaskData(doc.id, doc.data()));
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks by status:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get task by ID
router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskDoc = await db.collection("tasks").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(formatTaskData(taskDoc.id, taskDoc.data()));
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).json({ error: "Failed to retrieve task" });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const newTask = req.body;

    // Validate required fields
    if (!newTask.title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    // Add creation timestamp
    newTask.createdDate = admin.firestore.FieldValue.serverTimestamp();

    // Convert date strings to Firestore timestamps
    if (newTask.dueDate) {
      newTask.dueDate = admin.firestore.Timestamp.fromDate(
        new Date(newTask.dueDate)
      );
    }

    if (newTask.startDate) {
      newTask.startDate = admin.firestore.Timestamp.fromDate(
        new Date(newTask.startDate)
      );
    }

    // Initialize subtasks as empty array if not provided
    if (!newTask.subTasks) {
      newTask.subTasks = [];
    }

    // Initialize comments as empty array if not provided
    if (!newTask.comments) {
      newTask.comments = [];
    }

    // Set voting counts to zero if it's a voting task
    if (newTask.status === "voting") {
      newTask.votesYes = 0;
      newTask.votesNo = 0;
      newTask.votes = [];
    }

    const docRef = await db.collection("tasks").add(newTask);

    // If this task is assigned to a member, update their active tasks count
    if (newTask.assignedTo && newTask.status === "pending") {
      await updateMemberTaskCount(newTask.assignedTo, 1);
    }

    res.status(201).json(formatTaskData(docRef.id, newTask));
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;

    // Get the current task to check if assignee changes
    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const currentTask = taskDoc.data();

    // Add update timestamp
    updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Convert date strings to Firestore timestamps if present
    if (updatedData.dueDate) {
      updatedData.dueDate = admin.firestore.Timestamp.fromDate(
        new Date(updatedData.dueDate)
      );
    }

    if (updatedData.startDate) {
      updatedData.startDate = admin.firestore.Timestamp.fromDate(
        new Date(updatedData.startDate)
      );
    }

    if (updatedData.completionDate) {
      updatedData.completionDate = admin.firestore.Timestamp.fromDate(
        new Date(updatedData.completionDate)
      );
    }

    // Update the task in Firestore
    await db.collection("tasks").doc(taskId).update(updatedData);

    // Handle assignee changes if status is 'pending'
    if (
      currentTask.status === "pending" &&
      updatedData.assignedTo &&
      currentTask.assignedTo !== updatedData.assignedTo
    ) {
      // Decrement previous assignee's count
      if (currentTask.assignedTo) {
        await updateMemberTaskCount(currentTask.assignedTo, -1);
      }
      // Increment new assignee's count
      await updateMemberTaskCount(updatedData.assignedTo, 1);
    }

    // Handle status change to 'completed'
    if (
      currentTask.status !== "completed" &&
      updatedData.status === "completed"
    ) {
      // Add points to member's score
      if (currentTask.assignedTo && currentTask.points) {
        await updateMemberScore(currentTask.assignedTo, currentTask.points);
      }

      // Decrement active task count
      if (currentTask.assignedTo) {
        await updateMemberTaskCount(currentTask.assignedTo, -1);
      }
    }

    res.status(200).json({
      id: taskId,
      ...formatTaskData(taskId, { ...currentTask, ...updatedData }),
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Get the current task to check if it's assigned
    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();

    // Delete the task
    await db.collection("tasks").doc(taskId).delete();

    // If task was active and assigned, decrement the member's active task count
    if (task.status === "pending" && task.assignedTo) {
      await updateMemberTaskCount(task.assignedTo, -1);
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Mark task as complete
router.post("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Get the current task
    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();

    // Check if task is already completed
    if (task.status === "completed") {
      return res.status(400).json({ error: "Task is already completed" });
    }

    // Calculate if the task was completed on time
    const now = new Date();
    const dueDate = task.dueDate
      ? new Date(task.dueDate._seconds * 1000)
      : null;
    const completedOnTime = dueDate ? now <= dueDate : true;

    // Update the task
    const updateData = {
      status: "completed",
      completionDate: admin.firestore.FieldValue.serverTimestamp(),
      completedOnTime: completedOnTime,
    };

    await db.collection("tasks").doc(taskId).update(updateData);

    // Update member's score and decrement active task count
    if (task.assignedTo) {
      await updateMemberScore(task.assignedTo, task.points || 0);
      await updateMemberTaskCount(task.assignedTo, -1);
    }

    res.status(200).json({
      id: taskId,
      ...formatTaskData(taskId, { ...task, ...updateData }),
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// Add a comment to a task
router.post("/:id/comments", async (req, res) => {
  try {
    const taskId = req.params.id;
    const comment = req.body;

    // Validate
    if (!comment.content || !comment.author) {
      return res.status(400).json({ error: "Content and author are required" });
    }

    // Add timestamp and ID to the comment
    comment.timestamp = admin.firestore.FieldValue.serverTimestamp();
    comment.id = Date.now().toString(); // Simple unique ID

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Use array union to add to comments array
    await taskRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(comment),
    });

    // Return the comment with proper timestamp
    res.status(201).json({
      ...comment,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ===== VOTING ROUTES =====

// Submit a vote for a task
router.post("/:id/vote", async (req, res) => {
  try {
    const taskId = req.params.id;
    const vote = req.body;

    // Validate
    if (!vote.memberId || !vote.memberName || !vote.vote) {
      return res
        .status(400)
        .json({ error: "Member ID, name, and vote are required" });
    }

    if (vote.vote !== "yes" && vote.vote !== "no") {
      return res.status(400).json({ error: "Vote must be 'yes' or 'no'" });
    }

    // Get the current task
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();

    // Check if task is under voting
    if (task.status !== "voting") {
      return res.status(400).json({ error: "This task is not under voting" });
    }

    // Check if member has already voted
    if (task.votes && task.votes.some((v) => v.memberId === vote.memberId)) {
      return res.status(400).json({ error: "Member has already voted" });
    }

    // Prepare the vote object
    const voteObj = {
      memberId: vote.memberId,
      memberName: vote.memberName,
      memberImage: vote.memberImage || "assets/profile_pic.png",
      vote: vote.vote,
      comment: vote.comment || "",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update vote counts and add the vote to the array
    const updates = {
      votes: admin.firestore.FieldValue.arrayUnion(voteObj),
    };

    // Increment the appropriate vote counter
    if (vote.vote === "yes") {
      updates.votesYes = admin.firestore.FieldValue.increment(1);
    } else {
      updates.votesNo = admin.firestore.FieldValue.increment(1);
    }

    await taskRef.update(updates);

    res.status(200).json({
      message: "Vote submitted successfully",
      vote: {
        ...voteObj,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

// Assign task based on voting results
router.post("/:id/assign-from-voting", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { assignedTo } = req.body;

    // Validate
    if (!assignedTo) {
      return res.status(400).json({ error: "Assigned member ID is required" });
    }

    // Get the current task
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();

    // Check if task is under voting
    if (task.status !== "voting") {
      return res.status(400).json({ error: "This task is not under voting" });
    }

    // Update the task
    const updateData = {
      status: "pending",
      assignedTo: assignedTo,
    };

    await taskRef.update(updateData);

    // Update the assigned member's active task count
    await updateMemberTaskCount(assignedTo, 1);

    res.status(200).json({
      message: "Task assigned successfully",
      task: {
        id: taskId,
        ...formatTaskData(taskId, { ...task, ...updateData }),
      },
    });
  } catch (error) {
    console.error("Error assigning task from voting:", error);
    res.status(500).json({ error: "Failed to assign task" });
  }
});

// Reopen voting for a task
router.post("/:id/reopen-voting", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Get the current task
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Reset voting data
    await taskRef.update({
      votes: [],
      votesYes: 0,
      votesNo: 0,
      status: "voting",
    });

    res.status(200).json({ message: "Voting reopened successfully" });
  } catch (error) {
    console.error("Error reopening voting:", error);
    res.status(500).json({ error: "Failed to reopen voting" });
  }
});

// ===== HELPER FUNCTIONS =====

// Update a member's active task count
async function updateMemberTaskCount(memberId, increment) {
  try {
    const memberRef = db.collection("members").doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      console.warn(`Member ${memberId} not found when updating task count`);
      return;
    }

    await memberRef.update({
      activeTasks: admin.firestore.FieldValue.increment(increment),
    });
  } catch (error) {
    console.error("Error updating member task count:", error);
    throw error;
  }
}

// Update a member's score with points from completed tasks
async function updateMemberScore(memberId, points) {
  try {
    const memberRef = db.collection("members").doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      console.warn(`Member ${memberId} not found when updating score`);
      return;
    }

    // Increment the score and update completion stats
    const memberData = memberDoc.data();
    const completedTasks = (memberData.completedTasks || 0) + 1;
    const totalTasks = (memberData.totalTasks || 0) + 1;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);

    await memberRef.update({
      score: admin.firestore.FieldValue.increment(points),
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      completionRate: completionRate,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating member score:", error);
    throw error;
  }
}

module.exports = router;
