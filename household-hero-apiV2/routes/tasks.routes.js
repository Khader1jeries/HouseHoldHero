const express = require("express");
const { createTask } = require("../controllers/tasks.controller");
const router = express.Router();
router.post("/", createTask);
module.exports = router;
