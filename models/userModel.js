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
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["seeker", "owner", "admin"],
      default: "seeker",
    },
    phone: {
      type: String,
      required: true,
    },
    instagramId: {
      type: String,
      default: "Not Provided",
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt dates
  },
);

module.exports = mongoose.model("User", userSchema);
