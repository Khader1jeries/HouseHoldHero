const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
router.get("/android/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const messagesSnapshot = await db
      .collection("messages")
      .where("to", "==", email)
      .get();

    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
      };
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
