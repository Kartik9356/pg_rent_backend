const express = require("express");
const router = express.Router();

// Import both Middlewares
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware.js");
const upload = require("../config/cloudinary");

// Import Controllers
const {
  createProperty,
  getProperties,
  getMyProperties,
  deleteProperty,
  getAdminProperties,
  updatePropertyStatus,
} = require("../controllers/propertyController");

// --- PUBLIC ROUTES ---
router.get("/", getProperties);

// --- PRIVATE ROUTES (Owners/Seekers) ---
router.get("/my-properties", protect, getMyProperties);
router.post("/", protect, upload.array("images", 5), createProperty);
router.delete("/:id", protect, deleteProperty);

// --- ADMIN ROUTES ---
router.get('/admin/all', protect, admin, getAdminProperties);
router.put('/admin/:id/status', protect, admin, updatePropertyStatus);

module.exports = router;
