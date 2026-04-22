const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Fake Photos",
        "Owner Asking for Money Upfront",
        "Property Unavailable",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Dismissed"],
      default: "Open", // Admins will change this after reviewing
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
