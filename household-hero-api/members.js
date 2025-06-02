// members.js - Updated with REQUIRED family filtering
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// Helper functions
const formatMemberData = (id, data) => {
  const formattedData = { ...data };

  ["joinDate", "lastActive"].forEach((field) => {
    if (formattedData[field] && formattedData[field]._seconds) {
      formattedData[field] = new Date(formattedData[field]._seconds * 1000);
    }
  });

  return {
    id,
    ...formattedData,
  };
};

// Get all members with REQUIRED family filtering
router.get("/", async (req, res) => {
  try {
    const { familyId } = req.query;

    // REQUIRE familyId to prevent cross-family data access
    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required to retrieve members",
      });
    }

    const query = db.collection("members").where("familyId", "==", familyId);
    const membersSnapshot = await query.get();
    const members = [];

    membersSnapshot.forEach((doc) => {
      members.push(formatMemberData(doc.id, doc.data()));
    });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting members:", error);
    res.status(500).json({ error: "Failed to retrieve members" });
  }
});

// Get member by ID with family verification
router.get("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { familyId } = req.query;

    const memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    // Verify member belongs to the requesting family
    if (familyId && memberData.familyId !== familyId) {
      return res.status(403).json({ error: "Access denied to this member" });
    }

    // Enrich member data with their tasks
    let enrichedMember = formatMemberData(memberDoc.id, memberData);

    // Get member's tasks
    try {
      const tasksSnapshot = await db
        .collection("tasks")
        .where("assignedTo", "==", memberId)
        .where("familyId", "==", memberData.familyId)
        .get();

      const tasks = [];
      tasksSnapshot.forEach((taskDoc) => {
        const taskData = taskDoc.data();
        const formattedTask = {
          id: taskDoc.id,
          title: taskData.title,
          dueDate:
            taskData.dueDate && taskData.dueDate._seconds
              ? new Date(taskData.dueDate._seconds * 1000)
              : null,
          status: taskData.status,
          points: taskData.points || 0,
        };
        tasks.push(formattedTask);
      });

      enrichedMember.tasks = tasks;
    } catch (error) {
      console.error("Error fetching member tasks:", error);
      enrichedMember.tasks = [];
    }

    res.status(200).json(enrichedMember);
  } catch (error) {
    console.error("Error getting member:", error);
    res.status(500).json({ error: "Failed to retrieve member" });
  }
});

// Create new member - ensure familyId is set
router.post("/", async (req, res) => {
  try {
    const newMember = req.body;

    // Validate required fields
    if (
      (!newMember.fullName && !(newMember.firstName || newMember.lastName)) ||
      !newMember.email
    ) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // REQUIRE familyId
    if (!newMember.familyId) {
      return res.status(400).json({ error: "familyId is required" });
    }

    // Verify the family exists
    const familyDoc = await db
      .collection("families")
      .doc(newMember.familyId)
      .get();
    if (!familyDoc.exists) {
      return res
        .status(400)
        .json({ error: "Invalid familyId - family not found" });
    }

    // Ensure fullName is set if using firstName/lastName
    if (!newMember.fullName && (newMember.firstName || newMember.lastName)) {
      newMember.fullName = `${newMember.firstName || ""} ${
        newMember.lastName || ""
      }`.trim();
    }

    // Add creation timestamp
    newMember.joinDate = admin.firestore.FieldValue.serverTimestamp();
    newMember.lastActive = admin.firestore.FieldValue.serverTimestamp();

    // Initialize metrics
    if (!newMember.score) newMember.score = 0;
    if (!newMember.activeTasks) newMember.activeTasks = 0;
    if (!newMember.completionRate) newMember.completionRate = 0;
    if (!newMember.completedTasks) newMember.completedTasks = 0;
    if (!newMember.totalTasks) newMember.totalTasks = 0;

    const docRef = await db.collection("members").add(newMember);

    res.status(201).json(formatMemberData(docRef.id, newMember));
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});

// Update member with family verification
router.put("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const updatedData = req.body;
    const { familyId } = req.query;

    // Get current member to verify family
    const memberDoc = await db.collection("members").doc(memberId).get();
    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const currentMemberData = memberDoc.data();

    // Verify member belongs to the requesting family
    if (familyId && currentMemberData.familyId !== familyId) {
      return res
        .status(403)
        .json({ error: "Access denied to update this member" });
    }

    // Don't allow changing familyId through this endpoint
    delete updatedData.familyId;

    // Add update timestamp
    updatedData.lastActive = admin.firestore.FieldValue.serverTimestamp();

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

// Delete member with family verification
router.delete("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { familyId } = req.query;

    // REQUIRE familyId for deletion
    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required to delete member",
      });
    }

    const memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();
    if (memberData.familyId !== familyId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this member" });
    }

    // Delete all tasks assigned to this member within the same family
    const tasksSnapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", memberId)
      .where("familyId", "==", familyId)
      .get();

    const batch = db.batch();
    tasksSnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    // Delete the member
    batch.delete(memberDoc.ref);

    await batch.commit();

    res
      .status(200)
      .json({ message: "Member and their tasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// Get member's tasks with family filtering
router.get("/:id/tasks", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { familyId } = req.query;

    // Verify member exists and belongs to family
    const memberDoc = await db.collection("members").doc(memberId).get();
    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();
    if (familyId && memberData.familyId !== familyId) {
      return res.status(403).json({ error: "Access denied to member's tasks" });
    }

    // Query tasks assigned to this member within the same family
    const tasksSnapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", memberId)
      .where("familyId", "==", memberData.familyId)
      .get();

    const tasks = [];
    tasksSnapshot.forEach((doc) => {
      const taskData = doc.data();
      const formattedTask = {
        id: doc.id,
        ...taskData,
      };

      // Convert timestamps to dates
      ["dueDate", "startDate", "completionDate", "createdDate"].forEach(
        (field) => {
          if (formattedTask[field] && formattedTask[field]._seconds) {
            formattedTask[field] = new Date(
              formattedTask[field]._seconds * 1000
            );
          }
        }
      );

      tasks.push(formattedTask);
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting member tasks:", error);
    res.status(500).json({ error: "Failed to retrieve member tasks" });
  }
});

// Get leaderboard data with REQUIRED family filtering
router.get("/leaderboard/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = "month" } = req.query;

    if (!familyId) {
      return res.status(400).json({
        error: "familyId is required for leaderboard",
      });
    }

    // Get all family members for the specific family only
    const membersSnapshot = await db
      .collection("members")
      .where("familyId", "==", familyId)
      .get();

    const leaderboard = [];
    let position = 1;

    membersSnapshot.forEach((doc) => {
      const memberData = doc.data();
      leaderboard.push({
        position,
        id: doc.id,
        name:
          memberData.fullName ||
          `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim() ||
          memberData.name ||
          "Unknown",
        score: memberData.score || 0,
        profileImage: memberData.profileImage || "assets/profile_pic.png",
        tasks: memberData.completedTasks || 0,
        completionRate: memberData.completionRate || 0,
      });
      position++;
    });

    // Sort by score in descending order
    leaderboard.sort((a, b) => b.score - a.score);

    // Update positions after sorting
    leaderboard.forEach((member, index) => {
      member.position = index + 1;
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Failed to retrieve leaderboard data" });
  }
});

// Rest of the routes (performance, score update) remain similar with family verification...

module.exports = router;
