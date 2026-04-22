const express = require("express");
const router = express.Router();
const {
  createReport,
  getAdminReports,
  updateReportStatus,
} = require("../controllers/reportController");
const { protect, admin } = require("../middleware/authMiddleware"); // Ensure you have admin middleware!

// Seeker Route
router.post("/:propertyId", protect, createReport);

// Admin Routes
router.get("/admin/all", protect, admin, getAdminReports);
router.put("/admin/:id", protect, admin, updateReportStatus);

module.exports = router;
