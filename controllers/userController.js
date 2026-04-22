const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");
const Property = require("../models/propertyModel");
const { get } = require("mongoose");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user & send OTP
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, role, method } = req.body; // method = 'email' or 'sms'

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required" });
    }

    let user = await User.findOne({ email });

    // If user exists and is already verified, block registration
    if (user && user.isVerified) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    // If user doesn't exist, create a new unverified entry
    if (!user) {
      user = await User.create({ name, email, phone, role });
    }

    // Generate and save OTP
    const otpCode = generateOTP();
    user.otp = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send OTP based on user preference
    if (method === "sms") {
      await sendSms(user.phone, otpCode);
      res.status(200).json({ message: "OTP sent to mobile via SMS" });
    } else {
      await sendEmail(user.email, otpCode);
      res.status(200).json({ message: "OTP sent to email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login existing user & send OTP
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, method } = req.body; // method = 'email' or 'sms'

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    const otpCode = generateOTP();
    user.otp = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (method === "sms") {
      await sendSms(user.phone, otpCode);
      res.status(200).json({ message: "OTP sent to mobile via SMS" });
    } else {
      await sendEmail(user.email, otpCode);
      res.status(200).json({ message: "OTP sent to email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/verify
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // Success! Clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 1. Generate the token
    const token = generateToken(user._id);

    // 2. Set the token in an HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
      sameSite: "strict", // CSRF protection
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    // 3. Send back user data (without the token in the body)
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle saving/unsaving a property to wishlist
// @route   POST /api/users/wishlist/:propertyId
// @access  Private (Seeker/Owner)
const toggleSaveProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the property actually exists before saving it
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if property is already in the savedProperties array
    const isSaved = user.savedProperties.includes(propertyId);

    if (isSaved) {
      // Remove it from the array
      user.savedProperties = user.savedProperties.filter(
        (id) => id.toString() !== propertyId.toString(),
      );
      await user.save();
      res.status(200).json({
        message: "Property removed from wishlist",
        savedProperties: user.savedProperties,
      });
    } else {
      // Add it to the array
      user.savedProperties.push(propertyId);
      await user.save();
      res.status(200).json({
        message: "Property added to wishlist",
        savedProperties: user.savedProperties,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's saved properties
// @route   GET /api/users/wishlist
// @access  Private (Seeker/Owner)
const getSavedProperties = async (req, res) => {
  try {
    // Find the user and "populate" the savedProperties array
    // so it returns the actual property objects, not just the ID strings
    const user = await User.findById(req.user._id).populate("savedProperties");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.savedProperties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the currently logged-in user profile
// @route   GET /api/users/profile
// @access  Private (Requires Cookie)
const getUserProfile = async (req, res) => {
  try {
    // req.user is already provided by the 'protect' middleware
    const user = await User.findById(req.user._id).select("-otp -otpExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set expiration to a past date to instantly delete the cookie
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get all users with pagination and search
// @route   GET /api/users/admin/all
// @access  Private (Admin Only)
// @desc    Get all users with pagination, filtering, and search
// @route   GET /api/users/admin/all?page=1&limit=20&role=owner
// @access  Private (Admin Only)
const getAdminUsers = async (req, res) => {
  try {
    // 1. Pagination Setup (Defaults to page 1, limit 20 to match your properties route)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // 2. Build the Query Object
    let query = {};

    // Filter by Role (Equivalent to filtering by 'status' for properties)
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Search by Name or Email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // 3. Execute Query with Pagination
    const users = await User.find(query)
      .select("-otp -otpExpires") // Exclude sensitive login data
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Newest users first

    // 4. Get Total Count for Pagination Metadata
    const total = await User.countDocuments(query);

    // 5. Send Formatted Response (Matches your exact API documentation structure)
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyOtp,
  getUserProfile,
  toggleSaveProperty,
  getSavedProperties,
  getAdminUsers,
};
