const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserByEmail,
  updateUser,
  checkIfUserExists,
  checkVerificationCode,
  resetPassword,
  deleteUser,
} = require("../controllers/users.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:email", getUserByEmail);
router.put("/:email", updateUser);
router.get("/forgot-password/:email", checkIfUserExists);
router.get("/forgot-password/:email/:verfication", checkVerificationCode);
router.post("/reset-password", resetPassword);
router.delete("/delete-user/:email", deleteUser);

module.exports = router;
