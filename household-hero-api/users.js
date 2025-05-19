const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const crypto = require("crypto");

// Get Firestore database instance
const db = admin.firestore();

// Helper function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Simplified user registration without authentication or verification
router.post("/register-simple", async (req, res) => {
  try {
    const userData = req.body;

    // Validate required fields
    if (!userData.email || !userData.password || !userData.fullName) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password, and full name are required" 
      });
    }

    // Check if user already exists
    const userSnapshot = await db.collection("users")
      .where("email", "==", userData.email)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Hash the password
    const hashedPassword = hashPassword(userData.password);
    
    // Prepare user data for storage
    const newUser = {
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber || "",
      countryCode: userData.countryCode || "",
      password: hashedPassword, // Store hashed password
      role: "user",
      createdAt: admin.firestore.Timestamp.now(),
    };

    // Save user in Firestore
    const docRef = await db.collection("users").add(newUser);
    
    // Create response without returning the password
    const { password, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: docRef.id,
        ...userResponse
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to register user" 
    });
  }
});

// Simplified user login without authentication or verification
router.post("/login-simple", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const userSnapshot = await db.collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Get user data
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check password
    const hashedPassword = hashPassword(password);
    if (userData.password !== hashedPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Create response without returning the password
    const { password: storedPassword, ...userResponse } = userData;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        uid: userDoc.id,
        ...userResponse
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to login" 
    });
  }
});

// Create a new family
router.post("/create-family", async (req, res) => {
  try {
    const { name, admin } = req.body;
    
    if (!name || !admin) {
      return res.status(400).json({
        success: false,
        message: "Family name and admin ID are required"
      });
    }
    
    // Create the family
    const familyData = {
      name,
      admin,
      members: [admin],
      createdAt: admin.firestore.Timestamp.now()
    };
    
    const familyRef = await db.collection("families").add(familyData);
    
    // Update the user with family info
    await db.collection("users").doc(admin).update({
      familyId: familyRef.id,
      role: "admin"
    });
    
    res.status(201).json({
      success: true,
      message: "Family created successfully",
      family: {
        id: familyRef.id,
        ...familyData
      }
    });
  } catch (error) {
    console.error("Error creating family:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create family"
    });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // Don't allow password updates through this endpoint
    if (userData.password) {
      delete userData.password;
    }
    
    // Add update timestamp
    userData.updatedAt = admin.firestore.Timestamp.now();
    
    await db.collection("users").doc(userId).update(userData);
    
    res.status(200).json({
      success: true,
      message: "User profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile"
    });
  }
});

// Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    // Find user by email
    const userSnapshot = await db.collection("users")
      .where("email", "==", email)
      .get();
    
    res.status(200).json({
      success: true,
      exists: !userSnapshot.empty
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check email"
    });
  }
});

// Reset password directly (simplified without verification)
router.post("/reset-password-simple", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required"
      });
    }
    
    // Find user by email
    const userSnapshot = await db.collection("users")
      .where("email", "==", email)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update the password
    const userDoc = userSnapshot.docs[0];
    const hashedPassword = hashPassword(newPassword);
    
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
});

module.exports = router;