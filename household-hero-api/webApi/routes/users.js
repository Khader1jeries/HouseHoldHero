const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const crypto = require("crypto");
const { createMember } = require("../controllers/memberController");
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
      const userRef = db.collection("users").doc(email); // fixed: use db not req.firestore
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = hashPassword(password);

      await userRef.set({
        firstName,
        lastName,
        fullName: firstName + " " + lastName,
        phoneNumber,
        countryCode,
        createdAt,
        password: hashedPassword,
      });
      const adminEmail = req.body.email;
      const result = await createMember(req.body, adminEmail);
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
        const previousLogin = userData.lastLogin || null;

        await userRef.update({
          previousLogin: previousLogin,
          lastLogin: new Date().toISOString(),
        });
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
  try {
    const userEmail = req.params.email;
    const userData = req.body;
    if (userData.password) {
      delete userData.password;
    }
    if (userData.members) {
      delete userData.members;
    }
    if (userData.createdAt) {
      delete userData.createdAt;
    }
    if (userData.firstName && userData.lastName) {
      const userRef = db.collection("users").doc(userEmail);
      const userDoc = await userRef.get();
      const user = userDoc.data();
      userData.fullName = userData.firstName + " " + userData.lastName;
    } else if (userData.firstName) {
      const userRef = db.collection("users").doc(userEmail);
      const userDoc = await userRef.get();
      const user = userDoc.data(); // ✅ get document fields
      userData.fullName = userData.firstName + " " + user.lastName;
    } else if (userData.lastName) {
      const userRef = db.collection("users").doc(userEmail);
      const userDoc = await userRef.get();
      const user = userDoc.data(); // ✅ get document fields
      userData.fullName = user.firstName + " " + userData.lastName;
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
    userData.email = userDoc.id;
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
router.get("/forgot-password/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const userRef = db.collection("users").doc(email);
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
router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Step 1: Delete all tasks where adminEmail == email
    const tasksSnapshot = await db
      .collection("tasks")
      .where("adminEmail", "==", email)
      .get();

    const deleteTasks = tasksSnapshot.docs.map((doc) =>
      db.collection("tasks").doc(doc.id).delete()
    );

    // Step 2: Delete all members where adminEmail == email
    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", email)
      .get();

    const deleteMembers = membersSnapshot.docs.map((doc) =>
      db.collection("members").doc(doc.id).delete()
    );

    // Step 3: Delete all tasksUnderVote where adminEmail == email
    const tasksUnderVoteSnapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", email)
      .get();

    const deleteTasksUnderVote = tasksUnderVoteSnapshot.docs.map((doc) =>
      db.collection("tasksUnderVote").doc(doc.id).delete()
    );

    // Step 4: Wait for all deletions to finish
    await Promise.all([
      ...deleteTasks,
      ...deleteMembers,
      ...deleteTasksUnderVote,
    ]);

    // Step 5: Delete the user document
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.delete();

    res
      .status(200)
      .json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user and related data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
