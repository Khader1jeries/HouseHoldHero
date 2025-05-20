// members.js - Handle all member-related operations
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Get Firestore database instance
const db = admin.firestore();

/**
 * Get all members of a family
 * Requires familyId in query params
 */
router.get("/", async (req, res) => {
  try {
    const { familyId } = req.query;

    if (!familyId) {
      return res.status(400).json({ error: "Family ID is required" });
    }

    // Get the family document first to verify it exists
    const familyDoc = await db.collection("families").doc(familyId).get();

    if (!familyDoc.exists) {
      return res.status(404).json({ error: "Family not found" });
    }

    const familyData = familyDoc.data();

    // If no members in the family yet, return empty array
    if (!familyData.members || familyData.members.length === 0) {
      return res.status(200).json([]);
    }

    // Get all user documents referenced in the family members array
    const membersPromises = familyData.members.map((userId) =>
      db.collection("users").doc(userId).get()
    );

    const memberDocs = await Promise.all(membersPromises);

    // Format the response - exclude sensitive info
    const members = memberDocs
      .filter((doc) => doc.exists) // Only include existing documents
      .map((doc) => {
        const data = doc.data();
        // Exclude password and other sensitive fields
        const { password, ...memberData } = data;
        return {
          id: doc.id,
          ...memberData,
          // Add additional member-specific fields if needed
          activeTasks: data.activeTasks || 0,
          score: data.score || 0,
          completionRate: data.completionRate || 0,
        };
      });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting family members:", error);
    res.status(500).json({ error: "Failed to retrieve family members" });
  }
});

/**
 * Get a specific member by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const memberDoc = await db.collection("users").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const data = memberDoc.data();
    // Exclude password and other sensitive fields
    const { password, ...memberData } = data;

    // Get all tasks assigned to this member
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

    // Add stats to the response
    const memberWithStats = {
      id: memberDoc.id,
      ...memberData,
      tasks,
      activeTasks: tasks.filter((task) => task.status === "pending").length,
      completedTasks: tasks.filter((task) => task.status === "completed")
        .length,
      overdueTasksCount: tasks.filter((task) => {
        const dueDate = task.dueDate ? new Date(task.dueDate.toDate()) : null;
        return task.status === "pending" && dueDate && dueDate < new Date();
      }).length,
    };

    res.status(200).json(memberWithStats);
  } catch (error) {
    console.error("Error getting member:", error);
    res.status(500).json({ error: "Failed to retrieve member" });
  }
});

/**
 * Create a new family member
 * This creates a user account and adds them to a family
 */
router.post("/", async (req, res) => {
  try {
    console.log("Received member creation request:", req.body);
    const { familyId, ...memberData } = req.body;

    console.log("Family ID:", familyId);
    console.log("Member data:", memberData);

    // Validate required fields
    if (!familyId) {
      console.log("Error: Family ID is missing");
      return res.status(400).json({ error: "Family ID is required" });
    }

    // Check if we have either fullName OR firstName + lastName
    if (
      !memberData.fullName &&
      (!memberData.firstName || !memberData.lastName)
    ) {
      console.log("Error: Name fields are missing", {
        hasFullName: !!memberData.fullName,
        hasFirstName: !!memberData.firstName,
        hasLastName: !!memberData.lastName,
      });
      return res
        .status(400)
        .json({
          error:
            "Name is required (either fullName or both firstName and lastName)",
        });
    }

    if (!memberData.email) {
      console.log("Error: Email is missing");
      return res.status(400).json({ error: "Email is required" });
    }

    // If we have firstName and lastName but no fullName, create the fullName
    if (!memberData.fullName && memberData.firstName && memberData.lastName) {
      memberData.fullName = `${memberData.firstName} ${memberData.lastName}`;
      console.log(
        "Created fullName from firstName and lastName:",
        memberData.fullName
      );
    }

    // Check if email already exists
    const existingUserQuery = await db
      .collection("users")
      .where("email", "==", memberData.email)
      .get();

    if (!existingUserQuery.empty) {
      console.log("Error: Email already in use:", memberData.email);
      return res.status(400).json({ error: "Email already in use" });
    }

    // Validate familyId format
    if (!familyId || typeof familyId !== "string" || familyId.trim() === "") {
      console.log("Error: Invalid family ID format:", familyId);
      return res.status(400).json({ error: "Valid Family ID is required" });
    }

    try {
      // Check if family exists
      const familyDoc = await db.collection("families").doc(familyId).get();

      if (!familyDoc.exists) {
        console.log("Error: Family not found with ID:", familyId);
        return res.status(404).json({ error: "Family not found" });
      }

      // Add timestamps and default values
      const newMember = {
        ...memberData,
        familyId,
        role: memberData.role || "member",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        score: 0,
        completionRate: 0,
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
      };

      console.log("Prepared new member data:", newMember);
    } catch (err) {
      console.log("Error checking family:", err);
      return res.status(500).json({ error: "Error accessing family data" });
    }

    try {
      // Add the user to the users collection
      const userRef = await db.collection("users").add(newMember);
      console.log("Member added with ID:", userRef.id);

      // Update the family document to add the new member
      await db
        .collection("families")
        .doc(familyId)
        .update({
          members: admin.firestore.FieldValue.arrayUnion(userRef.id),
        });
      console.log("Family updated with new member:", userRef.id);

      // Return the new member without sensitive info
      const { password, ...safeNewMember } = newMember;

      res.status(201).json({
        id: userRef.id,
        ...safeNewMember,
      });
    } catch (err) {
      console.log("Error creating member or updating family:", err);
      res
        .status(500)
        .json({ error: "Failed to create family member: " + err.message });
    }
  } catch (error) {
    console.error("Error creating family member:", error);
    res
      .status(500)
      .json({ error: "Failed to create family member: " + error.message });
  }
});

/**
 * Update a member
 */
router.put("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const updateData = req.body;

    // Don't allow updating certain fields
    const { familyId, createdAt, score, completionRate, ...allowedUpdates } =
      updateData;

    // Add update timestamp
    allowedUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Update the document
    await db.collection("users").doc(memberId).update(allowedUpdates);

    res.status(200).json({
      id: memberId,
      ...allowedUpdates,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

/**
 * Delete a member
 * This removes them from the family but not from the users collection
 */
router.delete("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { familyId } = req.query;

    if (!familyId) {
      return res.status(400).json({ error: "Family ID is required" });
    }

    // Get the user to check that they're in the family
    const memberDoc = await db.collection("users").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    if (memberData.familyId !== familyId) {
      return res.status(403).json({ error: "Member is not in this family" });
    }

    // Get the family document
    const familyDoc = await db.collection("families").doc(familyId).get();

    if (!familyDoc.exists) {
      return res.status(404).json({ error: "Family not found" });
    }

    const familyData = familyDoc.data();

    // Check if it's the family admin trying to delete themselves
    if (memberId === familyData.admin) {
      return res.status(403).json({ error: "Family admin cannot be removed" });
    }

    // Update the family document to remove the member
    await db
      .collection("families")
      .doc(familyId)
      .update({
        members: admin.firestore.FieldValue.arrayRemove(memberId),
      });

    // Update member document to remove family association
    await db.collection("users").doc(memberId).update({
      familyId: null,
      role: "user",
    });

    res
      .status(200)
      .json({ message: "Member removed from family successfully" });
  } catch (error) {
    console.error("Error removing member from family:", error);
    res.status(500).json({ error: "Failed to remove member from family" });
  }
});

/**
 * Get the leaderboard for a family
 * Provides members ranked by score
 */
router.get("/leaderboard/:familyId", async (req, res) => {
  try {
    const { familyId } = req.params;
    const { period = "month" } = req.query; // 'week', 'month', 'year'

    // Get the family document first to verify it exists
    const familyDoc = await db.collection("families").doc(familyId).get();

    if (!familyDoc.exists) {
      return res.status(404).json({ error: "Family not found" });
    }

    const familyData = familyDoc.data();

    // If no members in the family yet, return empty array
    if (!familyData.members || familyData.members.length === 0) {
      return res.status(200).json([]);
    }

    // Get all user documents referenced in the family members array
    const membersPromises = familyData.members.map((userId) =>
      db.collection("users").doc(userId).get()
    );

    const memberDocs = await Promise.all(membersPromises);

    // Format the response with leaderboard-specific data
    let members = memberDocs
      .filter((doc) => doc.exists) // Only include existing documents
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName,
          profileImage: data.profileImage || "assets/profile_pic.png",
          score: data.score || 0,
          completionRate: data.completionRate || 0,
          tasks: data.activeTasks || 0,
        };
      });

    // Sort by score (descending)
    members.sort((a, b) => b.score - a.score);

    // Add position to each member
    members = members.map((member, index) => ({
      ...member,
      position: index + 1,
    }));

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

/**
 * Get performance history for a member
 */
router.get("/:id/performance", async (req, res) => {
  try {
    const memberId = req.params.id;

    // Get the member document
    const memberDoc = await db.collection("users").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Mock performance data (in a real app, this would come from a database)
    const weeklyPerformance = [
      { week: 1, tasks: 5, completed: 4, points: 210 },
      { week: 2, tasks: 6, completed: 5, points: 230 },
      { week: 3, tasks: 7, completed: 6, points: 270 },
      { week: 4, tasks: 8, completed: 7, points: 310 },
      { week: 5, tasks: 9, completed: 8, points: 340 },
      { week: 6, tasks: 10, completed: 9, points: 380 },
    ];

    res.status(200).json(weeklyPerformance);
  } catch (error) {
    console.error("Error getting member performance:", error);
    res.status(500).json({ error: "Failed to retrieve member performance" });
  }
});

/**
 * Update member score
 */
router.patch("/:id/score", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { points, operation = "add" } = req.body;

    if (points === undefined || isNaN(points)) {
      return res.status(400).json({ error: "Valid points value is required" });
    }

    // Get current member data
    const memberDoc = await db.collection("users").doc(memberId).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();
    const currentScore = memberData.score || 0;

    // Calculate new score based on operation
    let newScore;
    if (operation === "add") {
      newScore = currentScore + points;
    } else if (operation === "subtract") {
      newScore = Math.max(0, currentScore - points);
    } else if (operation === "set") {
      newScore = Math.max(0, points);
    } else {
      return res.status(400).json({ error: "Invalid operation" });
    }

    // Update the member document
    await db.collection("users").doc(memberId).update({
      score: newScore,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      id: memberId,
      previousScore: currentScore,
      newScore,
    });
  } catch (error) {
    console.error("Error updating member score:", error);
    res.status(500).json({ error: "Failed to update member score" });
  }
});

module.exports = router;
