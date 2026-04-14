const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  registerUser,
  loginUser,
  verifyOtp,
  toggleSaveProperty,
  getSavedProperties,
  getUserProfile, // Added
  logoutUser, // Added
} = require("../controllers/userController");

// Public Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);

// Private Routes
router.get("/profile", protect, getUserProfile); // Added
router.get("/wishlist", protect, getSavedProperties);
router.post("/wishlist/:propertyId", protect, toggleSaveProperty);
router.post("/logout", logoutUser); // Add to the Public Auth Routes section

module.exports = router;
