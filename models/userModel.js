const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["seeker", "owner", "admin"],
      default: "seeker",
    },
    instagramId: {
      type: String,
      default: "Not Provided",
    },
    isVerified: {
      type: Boolean,
      default: false, // Becomes true after they verify their first OTP
    },
    otp: {
      type: String, // Temporarily holds the 6-digit code
      default: null,
    },
    otpExpires: {
      type: Date, // Tracks when the OTP becomes invalid
      default: null,
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
