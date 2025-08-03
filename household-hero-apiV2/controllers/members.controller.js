const admin = require("firebase-admin");
const db = admin.firestore();
const { createMember } = require("../services/members.service");
const {
  getMonthlyLeaderboard,
  getYearlyLeaderboard,
} = require("../services/leaderboard.service");
const createNewMember = async (req, res) => {
  try {
    const { email, adminEmail } = req.body;
    const memberData = { ...req.body };
    delete memberData.adminEmail;

    // Duplicate-check
    const memberSnap = await db.collection("members").doc(email).get();
    if (memberSnap.exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    await createMember(memberData, adminEmail);

    return res
      .status(200)
      .json({ success: true, message: "Member created successfully" });
  } catch (error) {
    console.error("Create member error:", error);
    return res.status(error.code || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
const getAllMembersByAdminEmail = async (req, res) => {
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
        email: doc.id,
        ...doc.data(),
      });
    }

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting members:", error);
    res.status(500).json({ error: "Failed to retrieve members" });
  }
};
const getMember = async (req, res) => {
  try {
    const memberEmail = req.params.email;
    console.log(memberEmail);
    // Query the members collection using email as document ID
    const memberDoc = await db.collection("members").doc(memberEmail).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    // Format the response to match what Android expects
    const formattedMember = {
      email: memberDoc.id,
      fullName:
        memberData.fullName ||
        `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim(),
      score: memberData.score || 0,
      completedTasks: memberData.completedTasks || 0,
      activeTasks: memberData.activeTasks || 0,
      createdAt: memberData.joinDate || memberData.createdAt,
      // Include all other fields from memberData
      ...memberData,
    };

    console.log("member data fetched:", formattedMember);
    res.status(200).json(formattedMember);
  } catch (error) {
    console.error("Error fetching member for Android:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
};
const deleteMember = async (req, res) => {
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
};
const getRandom2Members = async (req, res) => {
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
};
const leaderboard = async (req, res) => {
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
};
const monthlyLeaderboard = async (req, res) => {
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
};
const yearlyLeaderboard = async (req, res) => {
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
};

module.exports = {
  createNewMember,
  getAllMembersByAdminEmail,
  getMember,
  getRandom2Members,
  leaderboard,
  monthlyLeaderboard,
  yearlyLeaderboard,
  deleteMember,
};
