const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const crypto = require("crypto");
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
router.post("/login", async (req, res) => {
  try {
    console.log("login android activated");
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
});
router.get("/forgot-password/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const userRef = db.collection("members").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, message: "User exists" });
  } catch (error) {
    console.error("Error checking user email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    console.log("aaa");
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
    await userRef.update({
      password: hashedPassword,
    });
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
});
router.get("/android/:email", async (req, res) => {
  try {
    const memberEmail = req.params.email;

    // Query the members collection using email as document ID
    const memberDoc = await db.collection("members").doc(memberEmail).get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: "Member not found" });
    }

    const memberData = memberDoc.data();

    // Format the response to match what Android expects
    const formattedMember = {
      id: memberDoc.id,
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

    console.log("Android member data fetched:", formattedMember);
    res.status(200).json(formattedMember);
  } catch (error) {
    console.error("Error fetching member for Android:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});
router.put("/android/:email", async (req, res) => {
  const { email } = req.params;
  const { firstName, lastName, countryCode, phoneNumber } = req.body;

  // Check if all required fields are present
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
      fullName: `${firstName} ${lastName}`, // optional: keep fullName in sync
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
});
router.delete("/android/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const memberRef = db.collection("members").doc(email);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await memberRef.delete();

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
