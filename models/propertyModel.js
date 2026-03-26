const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    propertyCategory: {
      type: String,
      enum: ["Flat", "PG"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Hidden"],
      default: "Pending",
    },

    // Address & Map Data
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    // Media & Features
    images: [{ type: String }], // Array of image URLs/paths
    generalAmenities: [{ type: String }],

    // For Simple Flats ---
    flatDetails: {
      bhkType: { type: String },
      furnishing: {
        type: String,
        enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
      },
      rentAmount: { type: Number },
      depositAmount: { type: Number },
      tenantPreference: {
        type: String,
        enum: ["Bachelors", "Family", "Anyone"],
      },
    },

    // For Complex PGs/Hostels ---
    roomConfigurations: [
      {
        sharingType: {
          type: String,
          enum: ["Single", "Double", "Triple", "Dormitory"],
        },
        pricePerBed: { type: Number },
        depositPerBed: { type: Number },
        totalBeds: { type: Number },
        availableBeds: { type: Number },
        foodIncluded: { type: Boolean, default: false },
        genderRestriction: {
          type: String,
          enum: ["Boys Only", "Girls Only", "Co-ed"],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create a geospatial index so Mapbox search is lightning fast
propertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Property", propertySchema);
