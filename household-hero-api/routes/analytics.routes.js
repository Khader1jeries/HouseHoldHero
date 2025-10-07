const express = require("express");
const {
  onTimeCompletion,
  taskDistribution,
  pointsByMember,
  TasksByStatus,
  pointsEarnedOverTime,
  createdOverTime,
  memberPreformance,
  reports,
} = require("../controllers/analytics.controller");
const router = express.Router();
router.get("/on-time-completion/:adminEmail", onTimeCompletion);
router.get("/task-distribution/:adminEmail", taskDistribution);
router.get("/points-by-member/:adminEmail", pointsByMember);
router.get("/tasks-by-status/:adminEmail", TasksByStatus);
router.get("/points-earned-over-time/:adminEmail", pointsEarnedOverTime);
router.get("/created-over-time/:adminEmail", createdOverTime);
router.get("/member-performance/:adminEmail", memberPreformance);
router.get("/reports/:adminEmail", reports);

module.exports = router;
