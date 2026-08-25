const { db, FieldValue } = require("../config/firebase");
const { createMember } = require("../services/members.service");
const { hashPassword } = require("../utils/hash.util");
const { sendVerificationEmail } = require("../services/email.service");
const {
  validateRegister,
  validateResetPassword,
} = require("../validations/users.validation");
const registerUser = async (req, res) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      createdAt,
      password,
    } = req.body;
    const userRef = db.collection("users").doc(email);
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
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const loginUser = async (req, res) => {
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
};
const getUserByEmail = async (req, res) => {
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
};
const updateUser = async (req, res) => {
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
    await db.collection("members").doc(userEmail).update(userData);
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
};
const checkIfUserExists = async (req, res) => {
  try {
    const { email } = req.params;
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const code = await sendVerificationEmail(email);
    await userRef.update({
      verfication: code,
    });
    res.status(200).json({ success: true, message: "User exists" });
  } catch (error) {
    console.error("Error checking user email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const checkVerificationCode = async (req, res) => {
  const { email, verfication } = req.params;

  try {
    const userRef = db.collection("users").doc(email);
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
const resetPassword = async (req, res) => {
  try {
    const validation = validateResetPassword(req.body);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }
    const { email, password } = req.body;
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
};
const deleteUser = async (req, res) => {
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
    // Step 4: Delete all messages where to == email
    const toMessagesSnapshot = await db
      .collection("messages")
      .where("to", "==", email)
      .get();

    const deleteToMessages = toMessagesSnapshot.docs.map((doc) =>
      db.collection("messages").doc(doc.id).delete()
    );
    // Step 5: Delete all messages where from == email
    const fromMessagesSnapshot = await db
      .collection("messages")
      .where("from", "==", email)
      .get();

    const deleteFromMessages = fromMessagesSnapshot.docs.map((doc) =>
      db.collection("messages").doc(doc.id).delete()
    );
    // Step 6: Wait for all deletions to finish
    await Promise.all([
      ...deleteTasks,
      ...deleteMembers,
      ...deleteTasksUnderVote,
      ...deleteToMessages,
      ...deleteFromMessages,
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
};
module.exports = {
  registerUser,
  loginUser,
  getUserByEmail,
  updateUser,
  checkIfUserExists,
  checkVerificationCode,
  resetPassword,
  deleteUser,
};
