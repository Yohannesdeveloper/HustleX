const express = require("express");
const { body, validationResult } = require("express-validator");
const Job = require("../models/Job");
const { auth, adminAuth } = require("../middleware/auth");
const { checkSubscriptionForJobPosting, getUserJobPostingStatus } = require("../middleware/subscription");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// ================================
// @route   GET /api/jobs/posting-status
// @desc    Get user's job posting status and limits
// @access  Private
// ================================
router.get("/posting-status", auth, getUserJobPostingStatus);

// ================================
// @route   GET /api/jobs/user/my-jobs
// @desc    Get user's posted jobs
// @access  Private
// ================================
router.get("/user/my-jobs", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    console.error("Get user jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   GET /api/jobs
// @desc    Get all jobs with pagination and filters
// @access  Public
// ================================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true, approved: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.jobType) filter.jobType = req.query.jobType;
    if (req.query.workLocation) filter.workLocation = req.query.workLocation;

    let sort = { createdAt: -1 };
    if (req.query.sortBy === "budget") sort = { budget: 1 };

    const jobs = await Job.find(filter)
      .populate("postedBy", "email profile")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
// ================================
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "email profile"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
// ================================
router.post(
  "/",
  auth,
  checkSubscriptionForJobPosting,
  [
    body("title").notEmpty().withMessage("Title is required").trim(),
    body("description").notEmpty().withMessage("Description is required"),
    body("budget").notEmpty().withMessage("Budget is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const jobData = {
        title: req.body.title,
        description: req.body.description,
        budget: req.body.budget,
        category: req.body.category,
        company: req.body.company ?? undefined,
        jobType: req.body.jobType ?? undefined,
        workLocation: req.body.workLocation ?? undefined,
        experience: req.body.experience ?? undefined,
        education: req.body.education ?? undefined,
        gender: req.body.gender ?? undefined,
        vacancies: req.body.vacancies ?? 1,
        skills: req.body.skills ?? [],
        requirements: req.body.requirements ?? [],
        benefits: req.body.benefits ?? [],
        contactEmail: req.body.contactEmail ?? undefined,
        contactPhone: req.body.contactPhone ?? undefined,
        companyWebsite: req.body.companyWebsite ?? undefined,
        deadline: req.body.deadline ?? undefined,
        visibility: req.body.visibility ?? "public",
        jobLink: req.body.jobLink ?? undefined,
        address: req.body.address ?? undefined,
        country: req.body.country ?? undefined,
        city: req.body.city ?? undefined,
        status: req.body.status ?? "active",
        applicants: 0,
        views: 0,
        postedBy: req.user._id,
        isActive: true,
        approved: req.user.roles && req.user.roles.includes('admin') ? true : false,
        applicationCount: 0,
      };

      const job = new Job(jobData);
      await job.save();

      // Send admin notification email about new job
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

        const isAdminPost = job.approved;

        await transporter.sendMail({
          from: `HustleX <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: isAdminPost ? `New job posted (Auto-approved): ${job.title}` : `New job posted (Requires Approval): ${job.title}`,
          html: `<p>${isAdminPost ? 'A new job was posted by an admin and auto-approved.' : 'A new job was posted and awaits approval.'}</p>
                 <p><strong>Title:</strong> ${job.title}</p>
                 <p><strong>Category:</strong> ${job.category}</p>
                 <p><strong>Budget:</strong> ${job.budget}</p>
                 <p><strong>Posted By:</strong> ${req.user.email}</p>
                 <p>${isAdminPost ? 'The job is already visible on the platform.' : 'Visit the admin panel to approve or decline.'}</p>`,
        });

        // Notify job owner that their job is received
        if (req.user?.email) {
          await transporter.sendMail({
            from: `HustleX <${process.env.EMAIL_USER}>`,
            to: req.user.email,
            subject: isAdminPost ? `Your job is now live: ${job.title}` : `Your job is pending approval: ${job.title}`,
            html: `<p>Hi,</p>
                   <p>Thanks for posting on HustleX. Your job "<strong>${job.title}</strong>" ${isAdminPost ? 'is <strong>now live</strong> and visible to freelancers.' : 'is <strong>pending approval</strong> and will be reviewed shortly.'}</p>
                   ${isAdminPost ? '<p>You can track applications from your dashboard.</p>' : '<p>We’ll email you once it’s approved and visible to freelancers.</p>'}
                   <p>If you need to make changes, you can edit the posting from your dashboard.</p>
                   <p>— HustleX Team</p>`,
          });
        }
      } catch (mailErr) {
        console.error("Failed to send job notification email:", mailErr.message);
      }

      res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ================================
// @route   GET /api/jobs/pending
// @desc    List pending jobs for approval
// @access  Admin
// ================================
router.get("/pending/list", adminAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ approved: false, status: { $ne: "declined" } })
      .populate("postedBy", "email profile")
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error("List pending jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   PUT /api/jobs/:id/approve
// @desc    Approve a job
// @access  Admin
// ================================
router.put("/:id/approve", adminAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: "active" },
      { new: true }
    ).populate("postedBy", "email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Notify job owner via email - move outside of main flow or at least don't block
    const sendApprovalEmail = async () => {
      try {
        if (job.postedBy?.email) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
          await transporter.sendMail({
            from: `HustleX <${process.env.EMAIL_USER}>`,
            to: job.postedBy.email,
            subject: `Your job was approved: ${job.title}`,
            html: `<p>Hello,</p>
                   <p>Your job "<strong>${job.title}</strong>" has been approved and is now visible to freelancers.</p>
                   <p>Category: ${job.category || ''}</p>
                   <p>Budget: ${job.budget || ''}</p>
                   <p>Thank you for using HustleX.</p>`,
          });
          console.log(`Approval email sent to ${job.postedBy.email}`);
        }
      } catch (mailErr) {
        console.error("Failed to send approval email:", mailErr.message);
      }
    };

    // Run email notification in background
    sendApprovalEmail();

    res.json({ message: "Job approved", job });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   PUT /api/jobs/:id/decline
// @desc    Decline a job
// @access  Admin
// ================================
router.put("/:id/decline", adminAuth, async (req, res) => {
  try {
    const { reason } = req.body || {};
    console.log(`[DEcline] Job ID: ${req.params.id}, Reason: ${reason}`);

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: "declined", declineReason: reason },
      { new: true }
    ).populate("postedBy", "email");

    if (!job) {
      console.log(`[DEcline] Job not found: ${req.params.id}`);
      return res.status(404).json({ message: "Job not found" });
    }

    // Notify job owner via email - non-blocking
    const sendDeclineEmail = async () => {
      try {
        if (job.postedBy?.email) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
          await transporter.sendMail({
            from: `HustleX <${process.env.EMAIL_USER}>`,
            to: job.postedBy.email,
            subject: `Your job was declined: ${job.title}`,
            html: `<p>Hello,</p>
                   <p>Your job "<strong>${job.title}</strong>" was declined${reason ? ` for the following reason: <em>${reason}</em>` : "."}</p>
                   <p>Please review and resubmit if appropriate. Thank you.</p>`,
          });
          console.log(`Decline email sent to ${job.postedBy.email}`);
        }
      } catch (mailErr) {
        console.error("Failed to send decline email:", mailErr.message);
      }
    };

    // Run email notification in background
    sendDeclineEmail();

    res.json({ message: "Job declined", job });
  } catch (error) {
    console.error("Decline job error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
});

// ================================
// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private
// ================================
router.put("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
// ================================
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// @route   DELETE /api/jobs/user/clear-all
// @desc    Delete all jobs posted by the current user
// @access  Private
// ================================
router.delete("/user/clear-all", auth, async (req, res) => {
  try {
    const result = await Job.deleteMany({ postedBy: req.user._id });

    res.json({
      message: `${result.deletedCount} jobs deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Clear all jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
