const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

router.post("/create", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Admin user not found" });
    }

    const newFamily = {
      name,
      admin: email,
      members: [email],
      createdAt: new Date().toISOString(),
    };

    const familyRef = await db.collection("families").add(newFamily);
    await db
      .collection("users")
      .doc(email)
      .update({ familyId: FieldValue.arrayUnion(familyRef.id) });

    res.status(201).json({
      success: true,
      message: "Family created",
      familyId: familyRef.id,
    });
  } catch (error) {
    console.error("Error creating family:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/:familyId", async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyDoc = await db.collection("families").doc(familyId).get();

    if (!familyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    res.status(200).json({
      success: true,
      family: familyDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching family:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.put("/:familyId", async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyData = req.body;

    const familyRef = db.collection("families").doc(familyId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    await familyRef.update(familyData);

    res.status(200).json({
      success: true,
      message: "Family updated successfully",
    });
  } catch (error) {
    console.error("Error updating family:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.put("/:familyId/add-member", async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to add a member",
      });
    }

    const familyRef = db.collection("families").doc(familyId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    await familyRef.update({
      members: FieldValue.arrayUnion(email),
    });

    res.status(200).json({
      success: true,
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.delete("/:familyId", async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyRef = db.collection("families").doc(familyId);
    const familyDoc = await familyRef.get();

    if (!familyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    await familyRef.delete();
    res.status(200).json({
      success: true,
      message: "Family deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting family:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
module.exports = router;
