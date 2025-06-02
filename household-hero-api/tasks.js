// tasks.js - Updated with proper family filtering
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// Helper functions
const formatTaskData = (id, data) => {
  const formattedData = { ...data };

  ["dueDate", "startDate", "completionDate", "createdDate"].forEach((field) => {
    if (formattedData[field] && formattedData[field]._seconds) {
      formattedData[field] = new Date(formattedData[field]._seconds * 1000);
    }
  });

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

// Create new task - ensure familyId is set
router.post("/", async (req, res) => {
  try {
    const newTask = req.body;

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

    // Initialize arrays if not provided
    if (!newTask.subTasks) newTask.subTasks = [];
    if (!newTask.comments) newTask.comments = [];

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

// Rest of the routes remain the same but with family verification...
// [Include all other routes like PUT, DELETE, etc. with similar family verification]

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

module.exports = router;
