// members.js - Updated with REQUIRED family filtering
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const { activeTasks } = require("../controllers/memberController");
const {
  getMonthlyLeaderboard,
  getYearlyLeaderboard,
} = require("../controllers/leaderboardController");

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
router.get("/getTwo/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;

    const snapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // return empty array if no members found
    }

    const allMembers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Shuffle and take 2 random members
    const shuffled = allMembers.sort(() => 0.5 - Math.random());
    const twoMembers = shuffled.slice(0, 2);

    res.status(200).json(twoMembers);
  } catch (error) {
    console.error("Error fetching two members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/monthly-leaderboard/:adminEmail", async (req, res) => {
  try {
    const adminEmail = req.params.adminEmail;

    if (!adminEmail) {
      return res
        .status(400)
        .json({ error: "adminEmail is required in the URL" });
    }

    const leaderboard = await getMonthlyLeaderboard(adminEmail);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
router.get("/yearly-leaderboard/:adminEmail", async (req, res) => {
  try {
    const adminEmail = req.params.adminEmail;

    if (!adminEmail) {
      return res
        .status(400)
        .json({ error: "adminEmail is required in the URL" });
    }

    const leaderboard = await getYearlyLeaderboard(adminEmail);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
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
