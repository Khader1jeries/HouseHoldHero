const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const crypto = require("crypto");
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      createdAt,
      password,
    } = req.body;

    if (
      email &&
      firstName &&
      lastName &&
      phoneNumber &&
      countryCode &&
      createdAt &&
      password
    ) {
      const userRef = req.firestore.collection("users").doc(email);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      hashPassword = hashPassword(password);
      await db
        .collection("users")
        .doc(email)
        .set({
          firstName: firstName,
          lastName: lastName,
          fullName: firstName + " " + lastName,
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          createdAt: createdAt,
          password: hashPassword,
        });

      return res.status(200).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing required user fields",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const userRef = req.firestore.collection("users").doc(email);
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
          message: "Log in successfully",
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

router.put("/:email", async (req, res) => {
  console.log("PUT request hit with email:", req.params.email);
  try {
    const userEmail = req.params.email;
    const userData = req.body;
    if (userData.password) {
      delete userData.password;
    }
    await db.collection("users").doc(userEmail).update(userData);
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: " Email and new password are required",
      });
    }
    const userRef = db.collection("users").doc(email);
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

router.delete("/delete-user/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to delete user",
      });
    }

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await userRef.delete();

    return res.status(200).json({
      success: true,
      message: `User with email ${email} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting user",
    });
  }
});
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userDoc = await db.collection("users").doc(email).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    delete userData.password; // never expose password

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
module.exports = router;
