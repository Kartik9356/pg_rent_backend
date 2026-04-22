const Report = require("../models/reportModel");
const Property = require("../models/propertyModel");

// @desc    Submit a fraud/issue report for a property
// @route   POST /api/reports/:propertyId
// @access  Private (Seeker/Owner)
const createReport = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const propertyId = req.params.propertyId;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      propertyId: propertyId,
      reason,
      description,
    });

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports with pagination (Admin only)
// @route   GET /api/reports/admin/all
// @access  Private (Admin Only)
const getAdminReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional status filter (?status=Open)
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Fetch reports and populate the user and property data so the admin can see context
    const reports = await Report.find(query)
      .populate("reporterId", "name email phone")
      .populate("propertyId", "title propertyCategory status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReports: total,
      },
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/admin/:id
// @access  Private (Admin Only)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Resolved' or 'Dismissed'

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getAdminReports, updateReportStatus };
