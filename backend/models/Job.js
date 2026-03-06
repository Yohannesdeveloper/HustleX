const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    jobSector: {
      type: String,
      trim: true,
    },
    jobSite: {
      type: String,
      trim: true,
    },
    compensationType: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String, // removed enum to accept any string
    },
    workLocation: {
      type: String, // removed enum to accept any string
    },
    experience: {
      type: String, // removed enum to accept any string
    },
    education: {
      type: String,
      default: "Not specified",
    },
    gender: {
      type: String,
      default: "Any",
    },
    vacancies: {
      type: Number,
      default: 1,
    },
    skills: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    contactEmail: String,
    contactPhone: String,
    companyWebsite: String,
    deadline: String,
    visibility: {
      type: String, // removed enum to accept any string
      default: "public",
    },
    jobLink: String,
    address: String,
    country: String, // now allows any string including null
    city: String,
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String, // removed enum to accept any string
      default: "active",
    },
    applicants: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
jobSchema.index({ title: "text", description: "text", company: "text" });
jobSchema.index({ category: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model("Job", jobSchema);
