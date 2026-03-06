const express = require("express");
const { body, validationResult } = require("express-validator");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const axios = require("axios");

const router = express.Router();

// @route   POST /api/applications
// @desc    Submit a job application
// @access  Private
router.post(
  "/",
  auth,
  [
    body("jobId").custom((value) => {
      if (!value) {
        throw new Error("Job ID is required");
      }
      // Check if it's a valid MongoDB ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(value)) {
        throw new Error("Invalid Job ID format");
      }
      return true;
    }),
    body("coverLetter").optional().isLength({ max: 2000 }),
    body("cvUrl").optional().custom((value) => {
      if (!value) return true; // Allow empty values
      return typeof value === 'string';
    }),
    body("portfolioUrl").optional().custom((value) => {
      if (!value) return true; // Allow empty values
      try {
        // Add protocol if missing
        let url = value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        new URL(url);
        return true;
      } catch {
        throw new Error("Portfolio URL must be a valid URL");
      }
    }),
  ],
  async (req, res) => {
    try {
      console.log("Received application data:", req.body);
      console.log("Request headers:", req.headers);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        console.log("Error details:", JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { jobId, coverLetter, cvUrl, portfolioUrl: rawPortfolioUrl } = req.body;

      // Process portfolio URL to ensure it has proper protocol
      let portfolioUrl = rawPortfolioUrl;
      if (portfolioUrl && portfolioUrl.trim()) {
        portfolioUrl = portfolioUrl.trim();
        if (!portfolioUrl.startsWith('http://') && !portfolioUrl.startsWith('https://')) {
          portfolioUrl = 'https://' + portfolioUrl;
        }
      }

      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user is trying to apply to their own job
      if (job.postedBy.toString() === req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "You cannot apply to your own job" });
      }

      // Check if user has already applied
      const existingApplication = await Application.findOne({
        job: jobId,
        applicant: req.user._id,
      });

      if (existingApplication) {
        // Allow re-application if status is rejected
        if (existingApplication.status === "rejected") {
          existingApplication.coverLetter = coverLetter;
          existingApplication.cvUrl = cvUrl;
          existingApplication.portfolioUrl = portfolioUrl;
          existingApplication.status = "pending";
          existingApplication.appliedAt = new Date();
          await existingApplication.save();

          return res.json({
            message: "Application resubmitted successfully",
            application: existingApplication,
          });
        } else {
          return res
            .status(400)
            .json({ message: "You have already applied to this job" });
        }
      }

      // Create new application
      const application = new Application({
        job: jobId,
        jobTitle: job.title,
        applicant: req.user._id,
        applicantEmail: req.user.email,
        coverLetter,
        cvUrl,
        portfolioUrl,
      });

      await application.save();

      // Update job application count
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

      // Emit real-time event for application submission
      const io = req.app.get('io');
      if (io) {
        // Emit to the job poster (company/client)
        const job = await Job.findById(jobId).populate('postedBy', 'email');
        if (job && job.postedBy) {
          io.to(`user_${job.postedBy._id}`).emit('new_application', {
            application: {
              _id: application._id,
              jobId: jobId,
              jobTitle: job.title,
              applicant: req.user._id,
              applicantEmail: req.user.email,
              appliedAt: application.appliedAt,
              status: application.status
            },
            message: 'New application received!'
          });
        }

        // Emit confirmation to the applicant
        io.to(`user_${req.user._id}`).emit('application_submitted', {
          application: {
            _id: application._id,
            jobId: jobId,
            jobTitle: job.title,
            status: 'pending'
          },
          message: 'Application submitted successfully!'
        });
      }

      res.status(201).json({
        message: "Application submitted successfully",
        application,
      });
    } catch (error) {
      console.error("Application submission error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
// @access  Private
router.get("/my-applications", auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title company budget category")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job (for job owners)
// @access  Private
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and user owns it
    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or access denied" });
    }

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "email profile")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (for job owners) and send email notification
// @access  Private
router.put(
  "/:id/status",
  auth,
  [body("status").isIn(["pending", "in_review", "hired", "rejected"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      const application = await Application.findById(id).populate("job");
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the job
      if (application.job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update application status and notes
      application.status = status;
      if (notes) application.notes = notes;
      await application.save();

      // Send email notification
      const statusMessages = {
        pending: "Your application is pending.",
        in_review: "You are in review.",
        hired: "You are hired.",
        rejected: "You are rejected.",
      };

      try {
        const notificationBaseUrl =
          process.env.NOTIFICATION_BASE_URL ||
          `http://localhost:${process.env.PORT || 5001}`;
        await axios.post(`${notificationBaseUrl}/api/notifications/email`, {
          to: application.applicantEmail,
          subject: `Application Status Update for ${application.jobTitle}`,
          body: statusMessages[status],
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue with response even if email fails
      }

      res.json({
        message: "Application status updated successfully",
        application,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/applications/my-jobs-applications
// @desc    Get all applications for user's jobs (optimized single query)
// @access  Private
router.get("/my-jobs-applications", auth, async (req, res) => {
  try {
    // Get all jobs posted by the user
    const userJobs = await Job.find({ postedBy: req.user._id }).select(
      "_id title company"
    );

    if (userJobs.length === 0) {
      return res.json([]);
    }

    // Get all applications for user's jobs in a single query
    const applications = await Application.find({
      job: { $in: userJobs.map((job) => job._id) },
    })
      .populate("applicant", "email profile")
      .sort({ appliedAt: -1 })
      .lean(); // Use lean() for better performance

    // Add company info to each application
    const applicationsWithCompany = applications.map((app) => {
      const job = userJobs.find((j) => j._id.toString() === app.job.toString());
      return {
        ...app,
        company: job?.company || "Unknown Company",
      };
    });

    res.json(applicationsWithCompany);
  } catch (error) {
    console.error("Get my jobs applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/applications/check/:jobId
// @desc    Check if user has applied to a job
// @access  Private
router.get("/check/:jobId", auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    const application = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    res.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error("Check application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
