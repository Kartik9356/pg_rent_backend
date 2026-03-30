const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyOtp,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);

module.exports = router;
