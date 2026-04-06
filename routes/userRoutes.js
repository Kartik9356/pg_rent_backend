const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Import the bouncer
const {
  registerUser,
  loginUser,
  verifyOtp,
  toggleSaveProperty,
  getSavedProperties,
} = require("../controllers/userController");

// Public Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);

// Private Wishlist Routes
router.get("/wishlist", protect, getSavedProperties);
router.post("/wishlist/:propertyId", protect, toggleSaveProperty);

module.exports = router;
