// -----------------------------------------------------------------------------
// Tasks-Under-Vote Controller
// -----------------------------------------------------------------------------
//  • Handles creation, retrieval, voting, commenting, recommendation, and
//    migration of “tasks under vote” into regular tasks.
//  • Only explanatory comments have been added; no executable code was changed.
//  • Comments do not mention specific routes or paths.
// -----------------------------------------------------------------------------

const admin = require("firebase-admin");
const db = admin.firestore();

const {
  calculateScoreForTasksUnderVote, // score based on Hungarian algorithm
  calculateWithHungarianAlgorithm, // optimal assignment helper
} = require("../services/score.service");

const { expired, addToAdmin } = require("../services/tasksUnderVote.service");
const { activeTasks, addTaskToMember } = require("../services/tasks.service");

const {
  validateCreateTaskUnderVote,
} = require("../validations/tasksUnderVote.validation");

// ───────────────────────────────────────────────────────────────────────────────
// Create a task that must be voted on before assignment
// ───────────────────────────────────────────────────────────────────────────────
const createTaskUnderVote = async (req, res) => {
  try {
    const task = req.body;

    const validation = validateCreateTaskUnderVote(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }

    // Normalize subtasks structure with defaults
    if (task.subtasks && typeof task.subtasks === "object") {
      Object.keys(task.subtasks).forEach((subtaskId) => {
        const subtask = task.subtasks[subtaskId];
        if (typeof subtask.status !== "boolean") subtask.status = false;
        if (typeof subtask.score !== "number") subtask.score = 0;
      });
    } else {
      task.subtasks = {
        [task.title]: { score: 0, status: false },
      };
    }

    task.status = false; // voting not yet resolved
    task.yes = []; // arrays for votes
    task.no = [];

    await expired(task); // append `expired` flag based on dueDate/startDate

    const docRef = await db.collection("tasksUnderVote").add(task);
    await addToAdmin(task, docRef.id); // reference in admin doc

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

// ───────────────────────────────────────────────────────────────────────────────
// Fetch one task-under-vote by Firestore ID
// ───────────────────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────────────────
// Return two random tasks under vote for preview
// ───────────────────────────────────────────────────────────────────────────────
const getRandom2TasksUnderVote = async (req, res) => {
  const { adminEmail } = req.params;

  try {
    const snapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    res.status(200).json(selected);
  } catch (error) {
    console.error("❌ Error fetching voting tasks:", error);
    res.status(500).json({ error: "Failed to fetch voting tasks" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// List tasks-under-vote that are still active (not expired)
// ───────────────────────────────────────────────────────────────────────────────
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
      if (task.expired === false) tasks.push(task);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching active tasks under vote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// List tasks-under-vote that have expired
// ───────────────────────────────────────────────────────────────────────────────
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
      if (task.expired === true) tasks.push(task);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching expired tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Convert a voted task into a regular task
// ───────────────────────────────────────────────────────────────────────────────
const moveToTask = async (req, res) => {
  try {
    const { id } = req.params; // ID in tasksUnderVote
    const additionalData = req.body;

    // Ensure migration fields provided
    const requiredFields = ["startDate", "dueDate", "assignedTo"];
    for (const field of requiredFields) {
      if (!additionalData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Fetch original vote task
    const voteTaskRef = db.collection("tasksUnderVote").doc(id);
    const voteTaskDoc = await voteTaskRef.get();
    if (!voteTaskDoc.exists) {
      return res.status(404).json({ error: "Task under vote not found" });
    }
    const voteTaskData = voteTaskDoc.data();

    // Compose final task object
    const task = {
      createdAt: new Date().toISOString(),
      description: voteTaskData.description,
      dueDate: additionalData.dueDate,
      startDate: additionalData.startDate,
      priority: voteTaskData.priority,
      title: voteTaskData.title,
      adminEmail: voteTaskData.adminEmail,
      assignedTo: additionalData.assignedTo,
      score: 0,
      subtasks: voteTaskData.subtasks,
    };

    // Compute personalized score for the assignee
    task.score = await calculateScoreForTasksUnderVote(task.assignedTo, id);

    // Normalize subtasks
    let count = 0;
    if (task.subtasks && typeof task.subtasks === "object") {
      count = Object.keys(task.subtasks).length;
    } else {
      task.subtasks = { [task.title]: { score: task.score, status: false } };
      count = 1;
    }
    const pointsDivided = count === 0 ? 0 : task.score / count;
    Object.keys(task.subtasks).forEach((sid) => {
      const st = task.subtasks[sid];
      st.status = typeof st.status === "boolean" ? st.status : false;
      st.score = pointsDivided;
    });
    task.status = false;

    // Add to main tasks collection
    const newTaskRef = await db.collection("tasks").add(task);

    // Link task to member & recalc active counts
    const memberRef = db.collection("members").doc(task.assignedTo);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists)
      return res.status(404).json({ error: "Member not found" });

    await addTaskToMember(memberRef.id, newTaskRef.id);
    await activeTasks(memberRef.id);

    // Remove task reference from admin’s tasksUnderVote array
    const userRef = db.collection("users").doc(task.adminEmail);
    const userDoc = await userRef.get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "Admin user not found" });

    await userRef.update({
      tasksUnderVote: admin.firestore.FieldValue.arrayRemove(id),
    });

    // Delete original vote task
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

// ───────────────────────────────────────────────────────────────────────────────
// Recommend the best member for a task using Hungarian algorithm
// ───────────────────────────────────────────────────────────────────────────────
const getRecommendation = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId) return res.status(400).json({ error: "Task ID is required" });

    const taskDoc = await db.collection("tasksUnderVote").doc(taskId).get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task under vote not found" });

    const taskData = taskDoc.data();

    // Retrieve family members for the admin
    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", taskData.adminEmail)
      .get();
    if (membersSnapshot.empty)
      return res.status(404).json({ error: "No family members found" });

    // Compute best assignee
    const bestMemberEmail = await calculateWithHungarianAlgorithm(
      taskData.adminEmail,
      taskId
    );
    if (!bestMemberEmail) {
      return res.status(404).json({
        error: "Could not determine best member using Hungarian algorithm",
      });
    }

    // Locate member details
    let bestMemberData = null;
    membersSnapshot.forEach((doc) => {
      if (doc.id === bestMemberEmail) {
        bestMemberData = { id: doc.id, data: doc.data() };
      }
    });
    if (!bestMemberData)
      return res.status(404).json({ error: "Best member data not found" });

    // Calculate display score
    const calculatedScore = await calculateScoreForTasksUnderVote(
      bestMemberData.id,
      taskId
    );

    // Build response object
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
        reason: `Optimal candidate selected using Hungarian Algorithm with a calculated score of ${bestMember.score} points.`,
      },
    });
  } catch (error) {
    console.error("Error getting task recommendation:", error);
    res.status(500).json({
      error: "Failed to get recommendation",
      details: error.message,
    });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Retrieve subtasks for a task-under-vote
// ───────────────────────────────────────────────────────────────────────────────
const getSubTasks = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) return res.status(404).json({ success: false });

    const subtasksObject = taskSnap.data().subtasks || {};
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

// ───────────────────────────────────────────────────────────────────────────────
// Update vote (yes/no) arrays for a task-under-vote
// ───────────────────────────────────────────────────────────────────────────────
const updateVote = async (req, res) => {
  const { taskId, vote, email } = req.params;

  try {
    const taskRef = db.collection("tasksUnderVote").doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const taskData = taskDoc.data();
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
      if (noArray.includes(email)) {
        updatedNo = noArray.filter((e) => e !== email);
      }
      updatedYes = [...yesArray, email];
    } else if (vote === "no") {
      if (noArray.includes(email)) {
        return res
          .status(200)
          .json({ success: false, message: "Already voted NO" });
      }
      updatedYes = yesArray.filter((e) => e !== email);
      updatedNo = [...noArray, email];
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vote type" });
    }

    await taskRef.update({ yes: updatedYes, no: updatedNo });

    return res
      .status(200)
      .json({ success: true, message: "Vote updated successfully" });
  } catch (error) {
    console.error("Error updating vote:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Add or update a comment on a task-under-vote
// ───────────────────────────────────────────────────────────────────────────────
const addComment = async (req, res) => {
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
    if (!taskDoc.exists)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const commentFieldPath = `comments.${email}`; // Firestore field path syntax
    await taskRef.update({ [commentFieldPath]: comment });

    return res
      .status(200)
      .json({ success: true, message: "Comment added/updated" });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Export controller functions
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  createTaskUnderVote,
  getTaskUnderVoteByID,
  getRandom2TasksUnderVote,
  getTasksUnderVoteIfActive,
  getTasksUnderVoteIfExpired,
  moveToTask,
  getRecommendation,
  getSubTasks,
  updateVote,
  addComment,
};
