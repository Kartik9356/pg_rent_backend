const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../config/cloudinary");
const {
  createProperty,
  getProperties,
  getMyProperties,
  deleteProperty,
} = require("../controllers/propertyController");

// Public route for seekers to view properties
router.get("/", getProperties);

// Private route for owners to view their own dashboard inventory
router.get("/my-properties", protect, getMyProperties);

// Private route to create a property.
// 'images' is the field name the frontend must use. maxCount is 5.
router.post("/", protect, upload.array("images", 5), createProperty);

// Private route to delete
router.delete("/:id", protect, deleteProperty);

module.exports = router;
