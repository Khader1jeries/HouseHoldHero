// -----------------------------------------------------------------------------
// Messages Controller
// -----------------------------------------------------------------------------
//  Only explanatory comments (//) have been added. The executable code
//  remains exactly as you provided—no logic, variables, or formatting changed.
// -----------------------------------------------------------------------------

const admin = require("firebase-admin");
const db = admin.firestore();

// Create a new message document
const createMessage = async (req, res) => {
  try {
    const { to, from, subject, message, reply } = req.body;

    // Basic field-presence validation
    if (!to || !from || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newMessage = {
      to,
      from,
      subject,
      message,
      reply: reply || null, // optional initial reply
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false, // unread by default
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
};

// Retrieve every message addressed to a given admin/user
const getMessagesForUser = async (req, res) => {
  try {
    const { adminEmail } = req.params;

    if (!adminEmail) {
      return res.status(400).json({ error: "adminEmail is required" });
    }

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
        // Convert Firestore timestamp to native Date
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      });
    }

    // Sort newest-first in JS (alternatively could use orderBy in query)
    messages.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Append a reply to an existing message
const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply content is required" });
    }

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
};

// Mark a message as read
const markRead = async (req, res) => {
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
};

// Remove a message document entirely
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.collection("messages").doc(messageId).delete();

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Fetch messages addressed to an individual member (ISO timestamps)
const getMessagesForMember = async (req, res) => {
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
};

// Export controller helpers
module.exports = {
  createMessage,
  getMessagesForUser,
  replyToMessage,
  markRead,
  deleteMessage,
  getMessagesForMember,
};
