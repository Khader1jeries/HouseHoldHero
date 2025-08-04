const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const {
  calculateScore,
  calculateWithHungarianAlgorithm,
} = require("../../controllers/scoreController");
const { expired } = require("../../controllers/tasksUnderVoteController");
const {
  activeTasks,
  addTaskToMember,
} = require("../../controllers/memberController");

router.post("/move/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const additionalData = req.body;

    // Required fields from body
    const requiredFields = ["createdAt", "startDate", "dueDate", "assignedTo"];

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
      adminEmail: voteTaskData.adminEmail,
      description: voteTaskData.description,
      priority: voteTaskData.priority,
      title: voteTaskData.title,
      subtasks: voteTaskData.subtasks,

      createdAt: additionalData.createdAt,
      startDate: additionalData.startDate,
      dueDate: additionalData.dueDate,
      assignedTo: additionalData.assignedTo,
      score: 0,
    };

    // Calculate score using both assignedTo and the task ID
    const score = await calculateScore(task.assignedTo, id);
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
    const newTaskRef = await db.collection("tasks").add(task);

    // Update member
    await addTaskToMember(task.assignedTo, newTaskRef.id);
    await activeTasks(task.assignedTo);

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
});
router.get("/recommendation/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Check if task exists
    const taskDoc = await db.collection("tasksUnderVote").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task under vote not found" });
    }

    const taskData = taskDoc.data();

    // Get all members using adminEmail (corrected field name)
    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", taskData.adminEmail)
      .get();

    if (membersSnapshot.empty) {
      return res.status(404).json({ error: "No family members found" });
    }

    // Use Hungarian algorithm to find the best member
    const bestMemberEmail = await calculateWithHungarianAlgorithm(
      taskData.adminEmail,
      taskId
    );

    if (!bestMemberEmail) {
      return res.status(404).json({
        error: "Could not determine best member using Hungarian algorithm",
      });
    }

    // Find the member details using the email returned from Hungarian algorithm
    let bestMemberData = null;
    membersSnapshot.forEach((doc) => {
      const memberData = doc.data();
      if (doc.id === bestMemberEmail) {
        bestMemberData = {
          id: doc.id,
          data: memberData,
        };
      }
    });

    if (!bestMemberData) {
      return res.status(404).json({ error: "Best member data not found" });
    }

    // Calculate the score for this specific member-task combination for display
    const calculatedScore = await calculateScore(bestMemberData.id, taskId);

    const bestMember = {
      id: bestMemberData.id,
      fullName:
        bestMemberData.data.fullName ||
        `${bestMemberData.data.firstName || ""} ${
          bestMemberData.data.lastName || ""
        }`.trim() ||
        bestMemberData.data.name ||
        "Unknown",
      email: bestMemberData.data.email,
      score: calculatedScore,
      activeTasks: bestMemberData.data.activeTasks || 0,
      overallScore: bestMemberData.data.score || 0,
    };

    // Return the recommendation
    res.status(200).json({
      success: true,
      taskId: taskId,
      taskTitle: taskData.title,
      recommendation: {
        memberId: bestMember.id,
        memberName: bestMember.fullName,
        memberEmail: bestMember.email,
        calculatedScore: bestMember.score,
        activeTasks: bestMember.activeTasks,
        overallScore: bestMember.overallScore,
        reason: `Optimal candidate selected using Hungarian Algorithm with a calculated score of ${bestMember.score} points. This member has ${bestMember.activeTasks} active tasks and an overall score of ${bestMember.overallScore}.`,
      },
    });
  } catch (error) {
    console.error("Error getting task recommendation:", error);
    res.status(500).json({
      error: "Failed to get recommendation",
      details: error.message,
    });
  }
});
module.exports = router;
