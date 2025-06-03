// tasks.js - Complete updated version with string date handling
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// Helper functions
const formatTaskData = (id, data) => {
  const formattedData = { ...data };

  // Handle date conversion - prioritize string format, handle old Firestore timestamps for backward compatibility
  ["dueDate", "startDate", "completionDate", "createdDate"].forEach((field) => {
    if (formattedData[field]) {
      try {
        // If it's already a string (new format), keep it
        if (typeof formattedData[field] === "string") {
          // Validate it's a proper date string
          const testDate = new Date(formattedData[field]);
          if (!isNaN(testDate.getTime())) {
            return; // Keep the string format
          }
        }

        // Handle old Firestore Timestamp objects (backward compatibility)
        if (formattedData[field]._seconds !== undefined) {
          const jsDate = new Date(formattedData[field]._seconds * 1000);
          formattedData[field] = jsDate.toISOString();
          console.log(
            `Converted ${field} from _seconds to string:`,
            formattedData[field]
          );
        } else if (formattedData[field].seconds !== undefined) {
          const jsDate = new Date(formattedData[field].seconds * 1000);
          formattedData[field] = jsDate.toISOString();
          console.log(
            `Converted ${field} from seconds to string:`,
            formattedData[field]
          );
        } else if (typeof formattedData[field].toDate === "function") {
          formattedData[field] = formattedData[field].toDate().toISOString();
          console.log(
            `Converted ${field} using toDate() to string:`,
            formattedData[field]
          );
        } else if (formattedData[field] instanceof Date) {
          formattedData[field] = formattedData[field].toISOString();
        } else {
          // Try to parse as date and convert to string
          const jsDate = new Date(formattedData[field]);
          if (!isNaN(jsDate.getTime())) {
            formattedData[field] = jsDate.toISOString();
          }
        }
      } catch (error) {
        console.error(
          `Error converting ${field}:`,
          error,
          formattedData[field]
        );
        // Don't set to null, keep original value for debugging
      }
    }
  });

  // Handle comments timestamps
  if (formattedData.comments && Array.isArray(formattedData.comments)) {
    formattedData.comments = formattedData.comments.map((comment) => {
      if (comment.timestamp) {
        try {
          if (typeof comment.timestamp === "string") {
            return comment; // Already a string
          } else if (comment.timestamp._seconds !== undefined) {
            comment.timestamp = new Date(
              comment.timestamp._seconds * 1000
            ).toISOString();
          } else if (comment.timestamp.seconds !== undefined) {
            comment.timestamp = new Date(
              comment.timestamp.seconds * 1000
            ).toISOString();
          } else if (typeof comment.timestamp.toDate === "function") {
            comment.timestamp = comment.timestamp.toDate().toISOString();
          } else if (!(comment.timestamp instanceof Date)) {
            comment.timestamp = new Date(comment.timestamp).toISOString();
          }
        } catch (error) {
          console.error("Error converting comment timestamp:", error);
          comment.timestamp = new Date().toISOString(); // Fallback
        }
      }
      return comment;
    });
  }

  // Handle votes timestamps
  if (formattedData.votes && Array.isArray(formattedData.votes)) {
    formattedData.votes = formattedData.votes.map((vote) => {
      if (vote.timestamp) {
        try {
          if (typeof vote.timestamp === "string") {
            return vote; // Already a string
          } else if (vote.timestamp._seconds !== undefined) {
            vote.timestamp = new Date(
              vote.timestamp._seconds * 1000
            ).toISOString();
          } else if (vote.timestamp.seconds !== undefined) {
            vote.timestamp = new Date(
              vote.timestamp.seconds * 1000
            ).toISOString();
          } else if (typeof vote.timestamp.toDate === "function") {
            vote.timestamp = vote.timestamp.toDate().toISOString();
          } else if (!(vote.timestamp instanceof Date)) {
            vote.timestamp = new Date(vote.timestamp).toISOString();
          }
        } catch (error) {
          console.error("Error converting vote timestamp:", error);
          vote.timestamp = new Date().toISOString(); // Fallback
        }
      }
      return vote;
    });
  }

  return {
    id,
    ...formattedData,
  };
};

// Get all tasks with REQUIRED family filtering
router.get("/", async (req, res) => {
  try {
    const { familyId, assignedTo, status } = req.query;

    // REQUIRE familyId to prevent cross-family data access
    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required to retrieve tasks",
      });
    }

    let query = db.collection("tasks").where("familyId", "==", familyId);

    // Apply additional filters if provided
    if (assignedTo) {
      query = query.where("assignedTo", "==", assignedTo);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    const tasksSnapshot = await query.get();
    const tasks = [];

    // Enrich tasks with member names
    for (const doc of tasksSnapshot.docs) {
      const taskData = doc.data();
      let enrichedTask = formatTaskData(doc.id, taskData);

      // Get member name if task is assigned
      if (taskData.assignedTo) {
        try {
          const memberDoc = await db
            .collection("members")
            .doc(taskData.assignedTo)
            .get();
          if (memberDoc.exists) {
            const memberData = memberDoc.data();
            enrichedTask.assignedToName =
              memberData.firstName ||
              memberData.fullName?.split(" ")[0] ||
              memberData.name ||
              "Unknown";
            enrichedTask.assignedToFullName =
              memberData.fullName ||
              `${memberData.firstName || ""} ${
                memberData.lastName || ""
              }`.trim() ||
              memberData.name ||
              "Unknown";
            enrichedTask.assigneeImage =
              memberData.profileImage || "assets/profile_pic.png";
          }
        } catch (error) {
          console.error(`Error fetching member ${taskData.assignedTo}:`, error);
          enrichedTask.assignedToName = "Unknown";
          enrichedTask.assignedToFullName = "Unknown";
        }
      }

      tasks.push(enrichedTask);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get tasks by status with REQUIRED family filtering
router.get("/status/:status", async (req, res) => {
  try {
    const status = req.params.status;
    const { familyId } = req.query;

    // REQUIRE familyId
    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required to retrieve tasks",
      });
    }

    const query = db
      .collection("tasks")
      .where("familyId", "==", familyId)
      .where("status", "==", status);

    const tasksSnapshot = await query.get();
    const tasks = [];

    // Enrich tasks with member names
    for (const doc of tasksSnapshot.docs) {
      const taskData = doc.data();
      let enrichedTask = formatTaskData(doc.id, taskData);

      if (taskData.assignedTo) {
        try {
          const memberDoc = await db
            .collection("members")
            .doc(taskData.assignedTo)
            .get();
          if (memberDoc.exists) {
            const memberData = memberDoc.data();
            enrichedTask.assignedToName =
              memberData.firstName ||
              memberData.fullName?.split(" ")[0] ||
              "Unknown";
            enrichedTask.assignedToFullName =
              memberData.fullName ||
              `${memberData.firstName || ""} ${
                memberData.lastName || ""
              }`.trim() ||
              "Unknown";
            enrichedTask.assigneeImage =
              memberData.profileImage || "assets/profile_pic.png";
          }
        } catch (error) {
          console.error(`Error fetching member ${taskData.assignedTo}:`, error);
          enrichedTask.assignedToName = "Unknown";
          enrichedTask.assignedToFullName = "Unknown";
        }
      }

      tasks.push(enrichedTask);
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks by status:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get task by ID with family verification
router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { familyId } = req.query;

    const taskDoc = await db.collection("tasks").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskData = taskDoc.data();

    // Verify task belongs to the requesting family
    if (familyId && taskData.familyId !== familyId) {
      return res.status(403).json({ error: "Access denied to this task" });
    }

    let enrichedTask = formatTaskData(taskDoc.id, taskData);

    // Enrich with member name
    if (taskData.assignedTo) {
      try {
        const memberDoc = await db
          .collection("members")
          .doc(taskData.assignedTo)
          .get();
        if (memberDoc.exists) {
          const memberData = memberDoc.data();
          enrichedTask.assignedToName =
            memberData.firstName ||
            memberData.fullName?.split(" ")[0] ||
            "Unknown";
          enrichedTask.assignedToFullName =
            memberData.fullName ||
            `${memberData.firstName || ""} ${
              memberData.lastName || ""
            }`.trim() ||
            "Unknown";
          enrichedTask.assigneeImage =
            memberData.profileImage || "assets/profile_pic.png";
        }
      } catch (error) {
        console.error(`Error fetching member ${taskData.assignedTo}:`, error);
        enrichedTask.assignedToName = "Unknown";
        enrichedTask.assignedToFullName = "Unknown";
      }
    }

    res.status(200).json(enrichedTask);
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).json({ error: "Failed to retrieve task" });
  }
});

// Create new task - Updated to save dates as strings
router.post("/", async (req, res) => {
  try {
    const newTask = req.body;

    console.log("Received new task data:", newTask);

    // Validate required fields
    if (!newTask.title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    if (!newTask.familyId) {
      return res.status(400).json({ error: "familyId is required" });
    }

    // Verify assigned member belongs to the same family (if task is assigned)
    if (newTask.assignedTo) {
      const memberDoc = await db
        .collection("members")
        .doc(newTask.assignedTo)
        .get();
      if (!memberDoc.exists) {
        return res.status(400).json({ error: "Assigned member not found" });
      }

      const memberData = memberDoc.data();
      if (memberData.familyId !== newTask.familyId) {
        return res.status(400).json({
          error: "Cannot assign task to member from different family",
        });
      }
    }

    // Convert dates to strings (like createdAt handling)
    if (newTask.dueDate) {
      try {
        if (typeof newTask.dueDate === "string") {
          newTask.dueDate = new Date(newTask.dueDate).toISOString();
        } else if (newTask.dueDate instanceof Date) {
          newTask.dueDate = newTask.dueDate.toISOString();
        } else {
          newTask.dueDate = new Date(newTask.dueDate).toISOString();
        }
        console.log("Converted dueDate to string:", newTask.dueDate);
      } catch (error) {
        console.error("Error converting dueDate:", error);
        return res.status(400).json({ error: "Invalid due date format" });
      }
    }

    if (newTask.startDate) {
      try {
        if (typeof newTask.startDate === "string") {
          newTask.startDate = new Date(newTask.startDate).toISOString();
        } else if (newTask.startDate instanceof Date) {
          newTask.startDate = newTask.startDate.toISOString();
        } else {
          newTask.startDate = new Date(newTask.startDate).toISOString();
        }
        console.log("Converted startDate to string:", newTask.startDate);
      } catch (error) {
        console.error("Error converting startDate:", error);
        return res.status(400).json({ error: "Invalid start date format" });
      }
    }

    // Set creation date as string (like createdAt)
    newTask.createdDate = new Date().toISOString();

    // Initialize arrays if not provided
    if (!newTask.subTasks) newTask.subTasks = [];
    if (!newTask.comments) newTask.comments = [];

    // Set voting counts to zero if it's a voting task
    if (newTask.status === "voting") {
      newTask.votesYes = 0;
      newTask.votesNo = 0;
      newTask.votes = [];
    }

    console.log("Final task data with string dates:", newTask);

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

// Update task - Updated to save dates as strings
router.put("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;
    const { familyId } = req.query;

    console.log("Updating task:", taskId, "with data:", updatedData);

    // Get current task to verify family
    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const currentTaskData = taskDoc.data();

    // Verify task belongs to the requesting family
    if (familyId && currentTaskData.familyId !== familyId) {
      return res
        .status(403)
        .json({ error: "Access denied to update this task" });
    }

    // Convert date fields to strings if they're being updated
    if (updatedData.dueDate) {
      try {
        if (typeof updatedData.dueDate === "string") {
          updatedData.dueDate = new Date(updatedData.dueDate).toISOString();
        } else if (updatedData.dueDate instanceof Date) {
          updatedData.dueDate = updatedData.dueDate.toISOString();
        } else {
          updatedData.dueDate = new Date(updatedData.dueDate).toISOString();
        }
        console.log("Updated dueDate to string:", updatedData.dueDate);
      } catch (error) {
        console.error("Error converting dueDate:", error);
        return res.status(400).json({ error: "Invalid due date format" });
      }
    }

    if (updatedData.startDate) {
      try {
        if (typeof updatedData.startDate === "string") {
          updatedData.startDate = new Date(updatedData.startDate).toISOString();
        } else if (updatedData.startDate instanceof Date) {
          updatedData.startDate = updatedData.startDate.toISOString();
        } else {
          updatedData.startDate = new Date(updatedData.startDate).toISOString();
        }
        console.log("Updated startDate to string:", updatedData.startDate);
      } catch (error) {
        console.error("Error converting startDate:", error);
        return res.status(400).json({ error: "Invalid start date format" });
      }
    }

    if (updatedData.completionDate) {
      try {
        if (typeof updatedData.completionDate === "string") {
          updatedData.completionDate = new Date(
            updatedData.completionDate
          ).toISOString();
        } else if (updatedData.completionDate instanceof Date) {
          updatedData.completionDate = updatedData.completionDate.toISOString();
        } else {
          updatedData.completionDate = new Date(
            updatedData.completionDate
          ).toISOString();
        }
        console.log(
          "Updated completionDate to string:",
          updatedData.completionDate
        );
      } catch (error) {
        console.error("Error converting completionDate:", error);
        return res
          .status(400)
          .json({ error: "Invalid completion date format" });
      }
    }

    // Add update timestamp as string
    updatedData.updatedAt = new Date().toISOString();

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
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { familyId } = req.query;

    // REQUIRE familyId for deletion
    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required to delete task",
      });
    }

    const taskDoc = await db.collection("tasks").doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskData = taskDoc.data();
    if (taskData.familyId !== familyId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this task" });
    }

    // Update member's active task count if task was assigned and active
    if (taskData.assignedTo && taskData.status === "pending") {
      await updateMemberTaskCount(taskData.assignedTo, -1);
    }

    await db.collection("tasks").doc(taskId).delete();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
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

    // Add timestamp as string
    comment.timestamp = new Date().toISOString();

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

// Mark task as complete
router.post("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskData = taskDoc.data();

    // Update task status and completion date as string
    const updateData = {
      status: "completed",
      completionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await taskRef.update(updateData);

    // Update member's active task count
    if (taskData.assignedTo) {
      await updateMemberTaskCount(taskData.assignedTo, -1);
      // Optionally update completed tasks count
      await updateMemberCompletedTaskCount(taskData.assignedTo, 1);
    }

    res.status(200).json({
      id: taskId,
      ...taskData,
      ...updateData,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// Add vote to task
router.post("/:id/vote", async (req, res) => {
  try {
    const taskId = req.params.id;
    const vote = req.body;

    // Validate
    if (!vote.memberId || !vote.vote || !vote.memberName) {
      return res
        .status(400)
        .json({ error: "memberId, vote, and memberName are required" });
    }

    // Add timestamp as string
    vote.timestamp = new Date().toISOString();

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskData = taskDoc.data();

    // Check if user already voted
    const existingVotes = taskData.votes || [];
    const hasVoted = existingVotes.some((v) => v.memberId === vote.memberId);

    if (hasVoted) {
      return res
        .status(400)
        .json({ error: "Member has already voted on this task" });
    }

    // Update vote counts and add vote
    const updateData = {};

    if (vote.vote === "yes") {
      updateData.votesYes = (taskData.votesYes || 0) + 1;
    } else {
      updateData.votesNo = (taskData.votesNo || 0) + 1;
    }

    updateData.votes = admin.firestore.FieldValue.arrayUnion(vote);
    updateData.updatedAt = new Date().toISOString();

    await taskRef.update(updateData);

    res.status(200).json({ message: "Vote added successfully", vote });
  } catch (error) {
    console.error("Error adding vote:", error);
    res.status(500).json({ error: "Failed to add vote" });
  }
});

// Assign task from voting
router.post("/:id/assign-from-voting", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ error: "assignedTo is required" });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {
      assignedTo,
      status: "pending",
      updatedAt: new Date().toISOString(),
    };

    await taskRef.update(updateData);

    // Update member's active task count
    await updateMemberTaskCount(assignedTo, 1);

    res.status(200).json({ message: "Task assigned successfully" });
  } catch (error) {
    console.error("Error assigning task from voting:", error);
    res.status(500).json({ error: "Failed to assign task" });
  }
});

// Reopen voting
router.post("/:id/reopen-voting", async (req, res) => {
  try {
    const taskId = req.params.id;

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {
      status: "voting",
      votes: [],
      votesYes: 0,
      votesNo: 0,
      assignedTo: "",
      updatedAt: new Date().toISOString(),
    };

    await taskRef.update(updateData);

    res.status(200).json({ message: "Voting reopened successfully" });
  } catch (error) {
    console.error("Error reopening voting:", error);
    res.status(500).json({ error: "Failed to reopen voting" });
  }
});

// Helper function to update member task count
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

// Helper function to update member completed task count
async function updateMemberCompletedTaskCount(memberId, increment) {
  try {
    const memberRef = db.collection("members").doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      console.warn(
        `Member ${memberId} not found when updating completed task count`
      );
      return;
    }

    const currentData = memberDoc.data();
    const completedTasks = (currentData.completedTasks || 0) + increment;
    const totalTasks = (currentData.totalTasks || 0) + increment;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await memberRef.update({
      completedTasks,
      totalTasks,
      completionRate,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating member completed task count:", error);
    throw error;
  }
}

module.exports = router;
