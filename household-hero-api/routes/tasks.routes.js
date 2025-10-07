const express = require("express");
const {
  createTask,
  getAllTasksRelatedToUser,
  getTaskByID,
  getRandom2Tasks,
  deleteTask,
  getRandom2ActiveTasksForMember,
  getAllMemberTasks,
  getRandom2FutureTasksForMember,
  getRandom2FinishedTasksForMember,
  allActiveTasksForMember,
  allFinishedTasksForMember,
  allFutureTasksForMember,
  getSubTasks,
  markSubtaskAsComplete,
} = require("../controllers/tasks.controller");
const router = express.Router();
router.post("/", createTask);
router.get("/", getAllTasksRelatedToUser);
router.get("/:id", getTaskByID);
router.get("/getTwo/:adminEmail", getRandom2Tasks);
router.delete("/:id", deleteTask);
router.get("/android/:assignedTo", getAllMemberTasks);
router.get("/android/TwoActive/:assignedTo", getRandom2ActiveTasksForMember);
router.get("/android/TwoFuture/:assignedTo", getRandom2FutureTasksForMember);
router.get(
  "/android/TwoFinished/:assignedTo",
  getRandom2FinishedTasksForMember
);
router.get("/android/AllActive/:assignedTo", allActiveTasksForMember);
router.get("/android/AllFinished/:assignedTo", allFinishedTasksForMember);
router.get("/android/AllFuture/:assignedTo", allFutureTasksForMember);
router.get("/android/subtasks/:taskId", getSubTasks);
router.put("/android/subtasks/complete/:taskId", markSubtaskAsComplete);
module.exports = router;
