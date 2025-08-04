const express = require("express");
const {
  getTaskUnderVoteByID,
  createTaskUnderVote,
  getRandom2TasksUnderVote,
  getTasksUnderVoteIfActive,
  getTasksUnderVoteIfExpired,
  moveToTask,
} = require("../controllers/tasksUnderVote.controller");
const router = express.Router();
router.post("/", createTaskUnderVote);
router.get("/id/:taskId", getTaskUnderVoteByID);
router.get("/getTwo/:adminEmail", getRandom2TasksUnderVote);
router.get("/active/:adminEmail", getTasksUnderVoteIfActive);
router.get("/expired/:adminEmail", getTasksUnderVoteIfExpired);
router.post("/move/:id", moveToTask);
module.exports = router;
