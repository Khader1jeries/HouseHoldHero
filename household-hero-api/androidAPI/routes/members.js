const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const crypto = require("crypto");
const transporter = require("../../emailService");
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
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = 4;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await transporter.sendMail({
      from: "khader.jeryes@gmail.com",
      to: email,
      subject: "reset verfication",
      text: `The verification code is: ${result}`,
    });
    await userRef.update({
      verfication: result,
    });
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
router.get("/forgot-password/:email/:verfication", async (req, res) => {
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
        verfication: admin.firestore.FieldValue.delete(),
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
});

module.exports = router;
