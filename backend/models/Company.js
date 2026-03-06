const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    foundedYear: {
      type: Number,
    },
    logo: {
      type: String, // URL to uploaded logo file
    },
    tradeLicense: {
      type: String, // URL to uploaded trade license file
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationData: {
      representative: String,
      submittedAt: Date,
    },
    taxId: {
      type: String,
      trim: true,
    },
    jobPositionAlternatives: [{
      title: String,
      category: String,
      skills: [String],
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    stats: {
      totalJobs: {
        type: Number,
        default: 0,
      },
      activeJobs: {
        type: Number,
        default: 0,
      },
      totalApplications: {
        type: Number,
        default: 0,
      },
      hiredFreelancers: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
companySchema.index({ userId: 1 });
companySchema.index({ companyName: 1 });
companySchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Company", companySchema);
