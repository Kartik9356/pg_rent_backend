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


const User = require("../models/userModel.js");
// GET all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select(
      "name email phone role createdAt"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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
