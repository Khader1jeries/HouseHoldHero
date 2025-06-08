// members.js - Updated with REQUIRED family filtering
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const { activeTasks } = require("../controllers/memberController");
const crypto = require("crypto");
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
// Create new member - ensure adminEmail is set
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

    let password = newMember.password;
    newMember.password = hashPassword(password);
    // Initialize default values
    newMember.score = 0;
    newMember.activeTasks = 0;
    newMember.completionRate = 0;
    newMember.completedTasks = 0;
    newMember.totalTasks = 0;
    const email = newMember.email;
    delete newMember.email;
    const docRef = db.collection("members").doc(email);

    await db
      .collection("users")
      .doc(newMember.adminEmail)
      .update({
        members: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
    await docRef.set(newMember);
    res.status(201).json({
      id: docRef.id,
      ...newMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});
// Get all members with REQUIRED admin filtering
router.get("/", async (req, res) => {
  try {
    const { adminEmail } = req.query;
    console.log(adminEmail);
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
    for (const doc of membersSnapshot.docs) {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting members:", error);
    res.status(500).json({ error: "Failed to retrieve members" });
  }
});

// Get member by email with adminEmail verification
router.get("/:email", async (req, res) => {
  try {
    const memberEmail = req.params.email;
    const adminEmail = req.query.adminEmail;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    const memberRef = db.collection("members").doc(memberEmail);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    if (memberData.adminEmail !== adminEmail) {
      return res
        .status(403)
        .json({ error: "Access denied: adminEmail mismatch" });
    }

    res.status(200).json({
      email: memberDoc.id,
      ...memberData,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
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
router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const memberRef = db.collection("members").doc(email);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();
    const adminEmail = memberData.adminEmail;

    if (!adminEmail) {
      return res
        .status(400)
        .json({ error: "Member is missing adminEmail field" });
    }

    // Remove this member's email from the user's members array
    const userRef = db.collection("users").doc(adminEmail);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        members: admin.firestore.FieldValue.arrayRemove(email),
      });
    }

    // Delete the member
    await memberRef.delete();

    res
      .status(200)
      .json({ message: "Member deleted and reference removed from user" });
  } catch (error) {
    console.error("Error deleting member and updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
