const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");

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

module.exports = { registerUser, loginUser, verifyOtp };
