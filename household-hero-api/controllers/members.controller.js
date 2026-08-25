// -----------------------------------------------------------------------------
// Member Controller
// -----------------------------------------------------------------------------
//  • All business logic is identical to your original file.
//  • Only explanatory comments (like these) have been inserted.
//  • No paths, variable names, or code statements were modified.
// -----------------------------------------------------------------------------

const { db, FieldValue } = require("../config/firebase");

const { createMember } = require("../services/members.service");
const { hashPassword } = require("../utils/hash.util");
const { sendVerificationEmail } = require("../services/email.service");
const {
  getMonthlyLeaderboard,
  getYearlyLeaderboard,
} = require("../services/leaderboard.service");

// Create a new member document
const createNewMember = async (req, res) => {
  try {
    const { email, adminEmail } = req.body;
    const memberData = { ...req.body }; // shallow-copy body
    delete memberData.adminEmail; // avoid duplicate storage

    // Check if member already exists
    const memberSnap = await db.collection("members").doc(email).get();
    if (memberSnap.exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    await createMember(memberData, adminEmail); // delegated write

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

// Fetch every member belonging to a specific adminEmail
const getAllMembersByAdminEmail = async (req, res) => {
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

// Fetch one member by email
const getMember = async (req, res) => {
  try {
    const memberEmail = req.params.email;

    const memberDoc = await db.collection("members").doc(memberEmail).get();
    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    const formattedMember = {
      email: memberDoc.id,
      fullName:
        memberData.fullName ||
        `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim(),
      score: memberData.score || 0,
      completedTasks: memberData.completedTasks || 0,
      activeTasks: memberData.activeTasks || 0,
      createdAt: memberData.joinDate || memberData.createdAt,
      ...memberData, // include any additional fields
    };

    res.status(200).json(formattedMember);
  } catch (error) {
    console.error("Error fetching member for Android:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
};

// Delete a member and clean up reference in the parent user
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

    // Remove the member’s email from admin’s members array
    const userRef = db.collection("users").doc(adminEmail);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        members: FieldValue.arrayRemove(email),
      });
    }

    await memberRef.delete(); // finally delete the member doc

    res
      .status(200)
      .json({ message: "Member deleted and reference removed from user" });
  } catch (error) {
    console.error("Error deleting member and updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Return exactly two random members for a quick preview
const getRandom2Members = async (req, res) => {
  try {
    const { adminEmail } = req.params;

    const snapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // none available
    }

    const allMembers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const shuffled = allMembers.sort(() => 0.5 - Math.random());
    const twoMembers = shuffled.slice(0, 2);

    res.status(200).json(twoMembers);
  } catch (error) {
    console.error("Error fetching two members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Score-sorted leaderboard (all-time)
const leaderboard = async (req, res) => {
  try {
    const { adminEmail } = req.params;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .orderBy("score", "desc")
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

// Monthly leaderboard helper
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

// Yearly leaderboard helper
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

// Member login – compares SHA-256 hash of password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const userRef = req.firestore.collection("members").doc(email);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(400).json({
          success: false,
          message: "User not existed",
        });
      }

      const hashedPassword = hashPassword(password);
      const userData = userDoc.data();
      const storedPassword = userData.password;

      if (hashedPassword == storedPassword) {
        return res.status(200).json({
          success: true,
          message: userData.adminEmail,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Wrong Password",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing required user fields",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if a member exists and send a verification email
const ifExist = async (req, res) => {
  try {
    const { email } = req.params;

    const userRef = db.collection("members").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await sendVerificationEmail(email);
    console.log(result);
    await userRef.update({ verfication: result });

    res.status(200).json({ success: true, message: "User exists" });
  } catch (error) {
    console.error("Error checking user email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify the code that was emailed
const verifyCode = async (req, res) => {
  const { email, verfication } = req.params;

  try {
    const userRef = db.collection("members").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const userData = userDoc.data();

    if (userData.verfication === verfication) {
      await userRef.update({
        verfication: FieldValue.delete(),
      });
      return res
        .status(200)
        .json({ success: true, message: "Verification successful." });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code." });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// Reset a member’s password
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: " Email and new password are required",
      });
    }

    const userRef = db.collection("members").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = hashPassword(password);
    await userRef.update({ password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update member profile fields
const updateMember = async (req, res) => {
  const { email } = req.params;
  const { firstName, lastName, countryCode, phoneNumber } = req.body;

  if (!firstName || !lastName || !countryCode || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const memberRef = db.collection("members").doc(email);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await memberRef.update({
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      fullName: `${firstName} ${lastName}`, // keep fullName in sync
    });

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Export all controller functions
module.exports = {
  createNewMember,
  getAllMembersByAdminEmail,
  getMember,
  getRandom2Members,
  leaderboard,
  monthlyLeaderboard,
  yearlyLeaderboard,
  deleteMember,
  login,
  ifExist,
  verifyCode,
  resetPassword,
  updateMember,
};
