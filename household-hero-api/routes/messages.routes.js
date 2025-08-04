const express = require("express");
const {
  createMessage,
  getMessagesForUser,
  replyToMessage,
  markRead,
  deleteMessage,
  getMessagesForMember,
} = require("../controllers/messages.controller");
const router = express.Router();
router.post("/", createMessage);
router.get("/:adminEmail", getMessagesForUser);
router.patch("/:messageId/reply", replyToMessage);
router.patch("/:messageId/read", markRead);
router.delete("/:messageId", deleteMessage);
router.get("/android/:email", getMessagesForMember);
module.exports = router;
