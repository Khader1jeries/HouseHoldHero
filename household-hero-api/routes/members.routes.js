const express = require("express");
const {
  createNewMember,
  getAllMembersByAdminEmail,
  getMember,
  getRandom2Members,
  leaderboard,
  monthlyLeaderboard,
  yearlyLeaderboard,
  deleteMember,
  login,
  ifExist,
  verifyCode,
  resetPassword,
  updateMember,
} = require("../controllers/members.controller");
const router = express.Router();
router.post("/", createNewMember);
router.get("/", getAllMembersByAdminEmail);
router.get("/:email", getMember);
router.get("/getTwo/:adminEmail", getRandom2Members);
router.get("/leaderboard/:adminEmail", leaderboard);
router.get("/monthly-leaderboard/:adminEmail", monthlyLeaderboard);
router.get("/yearly-leaderboard/:adminEmail", yearlyLeaderboard);
router.delete("/:email", deleteMember);
router.post("/login", login);
router.get("/forgot-password/:email", ifExist);
router.get("/forgot-password/:email/:verfication", verifyCode);
router.post("/reset-password", resetPassword);
router.put("/android/:email", updateMember);
router.delete("/android/:email", deleteMember);
module.exports = router;
