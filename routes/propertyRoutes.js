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
  getPropertyById,
  updatePropertyStatus,
  updateProperty,
} = require("../controllers/propertyController");


// --- ADMIN ROUTES ---
router.get("/admin/all", protect, admin, getAdminProperties);
router.put("/admin/:id/status", protect, admin, updatePropertyStatus);

// --- OWNER ROUTES ---
router.post("/", protect, upload.array("images", 5), createProperty);
router.get("/my-properties", protect, getMyProperties);
router.put("/:id", protect, /* upload.array('images', 5), */ updateProperty);
router.delete("/:id", protect, deleteProperty);

// --- PUBLIC ROUTES ---
router.get("/", getProperties);
router.get("/:id", getPropertyById);

module.exports = router;
