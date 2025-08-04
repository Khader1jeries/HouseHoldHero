const express = require("express");
const {
  createTask,
  getAllTasksRelatedToUser,
  getTaskByID,
  getRandom2Tasks,
  deleteTask,
} = require("../controllers/tasks.controller");
const router = express.Router();
router.post("/", createTask);
router.get("/", getAllTasksRelatedToUser);
router.get("/:id", getTaskByID);
router.get("/getTwo/:adminEmail", getRandom2Tasks);
router.delete("/:id", deleteTask);
module.exports = router;
