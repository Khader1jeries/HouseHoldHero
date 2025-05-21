// members.js - Handle all member-related functionality
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

// Helper functions
// Format member data for consistent responses
const formatMemberData = (id, data) => {
  // Convert Firestore timestamps to regular Date objects
  const formattedData = { ...data };

  // Handle date fields
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

// ===== MEMBER ROUTES =====

// Get all members with optional filtering by familyId
router.get("/", async (req, res) => {
  try {
    const { familyId } = req.query;
    let query = db.collection("members");

    // Apply filter if familyId is provided
    if (familyId) {
      query = query.where("familyId", "==", familyId);
    }

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

// Get member by ID
router.get("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const memberDoc = await db.collection("members").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json(formatMemberData(memberDoc.id, memberDoc.data()));
  } catch (error) {
    console.error("Error getting member:", error);
    res.status(500).json({ error: "Failed to retrieve member" });
  }
});

// Create new member
router.post("/", async (req, res) => {
  try {
    const newMember = req.body;

    // Validate required fields - support both firstName/lastName and fullName
    if (
      (!newMember.fullName && !(newMember.firstName || newMember.lastName)) ||
      !newMember.email
    ) {
      return res.status(400).json({ error: "Name and email are required" });
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

// Update member
router.put("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const updatedData = req.body;

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

// Delete member
router.delete("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { familyId } = req.query;

    // Verify the member belongs to the specified family
    if (familyId) {
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
    }

    await db.collection("members").doc(memberId).delete();

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// Get member's tasks
router.get("/:id/tasks", async (req, res) => {
  try {
    const memberId = req.params.id;

    // Query tasks assigned to this member
    const tasksSnapshot = await db
      .collection("tasks")
      .where("assignedTo", "==", memberId)
      .get();

    const tasks = [];
    tasksSnapshot.forEach((doc) => {
      // Format dates properly
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

// Get member's performance data
router.get("/:id/performance", async (req, res) => {
  try {
    const memberId = req.params.id;

    // In a real app, you would query a collection of task activity or performance data
    // For this demo, we'll return mock data
    const mockPerformanceData = [
      { week: 1, tasks: 5, completed: 4, points: 210 },
      { week: 2, tasks: 6, completed: 5, points: 230 },
      { week: 3, tasks: 7, completed: 6, points: 270 },
      { week: 4, tasks: 8, completed: 7, points: 310 },
      { week: 5, tasks: 9, completed: 8, points: 340 },
      { week: 6, tasks: 10, completed: 9, points: 380 },
    ];

    res.status(200).json(mockPerformanceData);
  } catch (error) {
    console.error("Error getting member performance:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve member performance data" });
  }
});

// Get leaderboard data
router.get("/leaderboard/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = "month" } = req.query; // Default to monthly

    // Get all family members
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
          `${memberData.firstName} ${memberData.lastName}`,
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

// Update member's score
router.patch("/:id/score", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { points, operation = "add" } = req.body;

    // Validate
    if (points === undefined || isNaN(points)) {
      return res.status(400).json({ error: "Valid points value is required" });
    }

    const memberRef = db.collection("members").doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();
    let newScore;

    switch (operation) {
      case "add":
        newScore = (memberData.score || 0) + points;
        await memberRef.update({
          score: admin.firestore.FieldValue.increment(points),
          lastActive: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "subtract":
        newScore = Math.max(0, (memberData.score || 0) - points);
        await memberRef.update({
          score: newScore,
          lastActive: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "set":
        newScore = Math.max(0, points);
        await memberRef.update({
          score: newScore,
          lastActive: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      default:
        return res.status(400).json({ error: "Invalid operation" });
    }

    res.status(200).json({
      id: memberId,
      score: newScore,
      message: `Score successfully ${operation}ed`,
    });
  } catch (error) {
    console.error("Error updating member score:", error);
    res.status(500).json({ error: "Failed to update member score" });
  }
});

module.exports = router;
