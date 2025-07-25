// household-hero-api/webApi/routes/messages.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

router.post("/", async (req, res) => {
  try {
    const { to, from, subject, message, reply } = req.body;

    // ✅ Basic validation
    if (!to || !from || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newMessage = {
      to,
      from,
      subject,
      message,
      reply: reply || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false, // Add read status
    };

    const docRef = await db.collection("messages").add(newMessage);

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "Message created successfully",
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// GET messages for admin
router.get("/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    // Option 1: With ordering (requires index)
    // const snapshot = await db
    //   .collection("messages")
    //   .where("to", "==", adminEmail)
    //   .orderBy("createdAt", "desc")
    //   .get();

    // Option 2: Without ordering (no index required - temporary fix)
    const snapshot = await db
      .collection("messages")
      .where("to", "==", adminEmail)
      .get();

    const messages = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      messages.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to JS Date
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      });
    }

    // Sort messages by date in JavaScript (if not using orderBy in query)
    messages.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Reply to a message
router.patch("/:messageId/reply", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply content is required" });
    }

    // Update the message with the reply
    await db.collection("messages").doc(messageId).update({
      reply: reply,
      repliedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// Mark message as read
router.patch("/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.collection("messages").doc(messageId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete message
router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.collection("messages").doc(messageId).delete();
    console.log("deleting");
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
