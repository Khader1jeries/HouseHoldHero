const express = require("express");
const {
  getTaskUnderVoteByID,
  createTaskUnderVote,
  getRandom2TasksUnderVote,
  getTasksUnderVoteIfActive,
  getTasksUnderVoteIfExpired,
  moveToTask,
  getRecommendation,
  getSubTasks,
  updateVote,
  addComment,
} = require("../controllers/tasksUnderVote.controller");
const router = express.Router();
router.post("/", createTaskUnderVote);
router.get("/id/:taskId", getTaskUnderVoteByID);
router.get("/getTwo/:adminEmail", getRandom2TasksUnderVote);
router.get("/active/:adminEmail", getTasksUnderVoteIfActive);
router.get("/expired/:adminEmail", getTasksUnderVoteIfExpired);
router.post("/move/:id", moveToTask);
router.get("/recommendation/:taskId", getRecommendation);
router.get("/android/subtasks/:taskId", getSubTasks);
router.put("/android/updateVote/:taskId/:vote/:email", updateVote);
router.put("/android/addComment/:taskId/:email", addComment);
module.exports = router;
