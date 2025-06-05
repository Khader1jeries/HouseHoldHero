// members.js - Updated with REQUIRED family filtering
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

// Get all members with REQUIRED admin filtering
router.get("/", async (req, res) => {
  try {
    const { adminEmail } = req.query;

    if (!adminEmail) {
      return res.status(400).json({
        error: "adminEmail is required to retrieve members",
      });
    }

    const query = db
      .collection("members")
      .where("adminEmail", "==", adminEmail);
    const membersSnapshot = await query.get();

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

// Get member by email
router.get("/:email", async (req, res) => {
  try {
    const memberEmail = req.params.email;

    const memberRef = db.collection("members").doc(memberEmail);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({
      email: memberDoc.id,
      ...memberDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
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

    // REQUIRE adminEmail
    if (!newMember.adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    // Ensure fullName is set if using firstName/lastName
    if (!newMember.fullName && (newMember.firstName || newMember.lastName)) {
      newMember.fullName = `${newMember.firstName || ""} ${
        newMember.lastName || ""
      }`.trim();
    }

    // Initialize default values
    newMember.score = 0;
    newMember.activeTasks = 0;
    newMember.completionRate = 0;
    newMember.completedTasks = 0;
    newMember.totalTasks = 0;
    const email = newMember.email;
    delete newMember.email;
    const docRef = db.collection("members").doc(email);
    await docRef.set(newMember);
    await db
      .collection("users")
      .doc(newMember.adminEmail)
      .update({
        members: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
    res.status(201).json({
      id: docRef.id,
      ...newMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const memberEmail = req.params.id;
    const updateData = req.body;

    const memberRef = db.collection("members").doc(memberEmail);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    await memberRef.update(updateData);

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// Get leaderboard data with REQUIRED family filtering
router.get("/leaderboard/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .orderBy("score", "desc") // Sort by score descending
      .get();

    const leaderboard = [];
    membersSnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Rest of the routes (performance, score update) remain similar with family verification...

module.exports = router;
