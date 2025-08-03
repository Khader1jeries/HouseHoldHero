const express = require("express");
const { onTimeCompletion } = require("../controllers/analytics.controller");
const router = express.Router();
router.get("/on-time-completion/:adminEmail", onTimeCompletion);
module.exports = router;
