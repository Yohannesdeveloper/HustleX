const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const { auth } = require("../middleware/auth");

// ================================
// @route   GET /api/statistics
// @desc    Get platform-wide statistics
// @access  Public
// ================================
router.get("/", async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalFreelancers,
      totalClients,
      totalApplications,
      completedJobs,
    ] = await Promise.all([
      Job.countDocuments({}),
      Job.countDocuments({ isActive: true, approved: true }),
      User.countDocuments({ roles: { $in: ["freelancer"] } }),
      User.countDocuments({ roles: { $in: ["client"] } }),
      Application.countDocuments({}),
      Job.countDocuments({ status: "completed" }),
    ]);

    res.json({
      totalJobs,
      activeJobs,
      totalFreelancers,
      totalClients,
      totalApplications,
      completedJobs,
      pendingJobs: await Job.countDocuments({ approved: false }),
      totalUsers: totalFreelancers + totalClients,
    });
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
});

// ================================
// @route   GET /api/statistics/user
// @desc    Get user-specific statistics
// @access  Private
// ================================
router.get("/user", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.currentRole || req.user.roles[0];

    if (userRole === "client") {
      const [
        postedJobs,
        activeJobs,
        totalApplications,
        acceptedApplications,
        completedJobs,
      ] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Job.countDocuments({ postedBy: userId, isActive: true }),
        Application.countDocuments({ jobId: { $in: await Job.find({ postedBy: userId }).distinct("_id") } }),
        Application.countDocuments({
          jobId: { $in: await Job.find({ postedBy: userId }).distinct("_id") },
          status: "accepted",
        }),
        Job.countDocuments({ postedBy: userId, status: "completed" }),
      ]);

      res.json({
        postedJobs,
        activeJobs,
        totalApplications,
        acceptedApplications,
        completedJobs,
        pendingApplications: totalApplications - acceptedApplications,
      });
    } else {
      // Freelancer stats
      const [
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        pendingApplications,
        completedProjects,
      ] = await Promise.all([
        Application.countDocuments({ freelancerId: userId }),
        Application.countDocuments({ freelancerId: userId, status: "accepted" }),
        Application.countDocuments({ freelancerId: userId, status: "rejected" }),
        Application.countDocuments({ freelancerId: userId, status: "pending" }),
        Application.countDocuments({ freelancerId: userId, status: "completed" }),
      ]);

      res.json({
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        pendingApplications,
        completedProjects,
      });
    }
  } catch (error) {
    console.error("User statistics error:", error);
    res.status(500).json({ message: "Failed to fetch user statistics", error: error.message });
  }
});

// ================================
// @route   GET /api/statistics/jobs
// @desc    Get job statistics by category
// @access  Public
// ================================
router.get("/jobs", async (req, res) => {
  try {
    const jobStats = await Job.aggregate([
      { $match: { isActive: true, approved: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgBudget: { $avg: "$budget" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ categories: jobStats });
  } catch (error) {
    console.error("Job statistics error:", error);
    res.status(500).json({ message: "Failed to fetch job statistics", error: error.message });
  }
});

module.exports = router;
