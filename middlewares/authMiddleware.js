const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the cookies
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to request
      req.user = await User.findById(decoded.id).select("-otp -otpExpires");

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
