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
router.get("/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

    const snapshot = await db
      .collection("messages")
      .where("to", "==", adminEmail)
      .orderBy("createdAt", "desc")
      .get();

    const messages = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (data.reply && data.reply.trim() !== "") {
        // 🔥 Delete the document from Firestore
        await db.collection("messages").doc(doc.id).delete();
        continue; // optional: skip adding it to the messages list
      }

      messages.push({
        id: doc.id,
        ...data,
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
