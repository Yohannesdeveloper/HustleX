const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantEmail: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    cvUrl: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "hired", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

// Update the updatedAt field before saving
applicationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Application", applicationSchema);






