
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const Project = require("../models/Project");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { parsePagination } = require("../lib/pagination");
const { cacheMiddleware, invalidatePattern } = require("../middleware/cache");

function attachCompanies(users, companyByUser) {
  return users.map((client) => {
    const company = companyByUser.get(String(client._id));
    if (!company) return client;
    return {
      ...client,
      avatar: company.logo,
      companyProfile: {
        companyName: company.companyName,
        logo: company.logo,
        description: company.description,
        industry: company.industry,
      },
    };
  });
}

// GET /api/users/freelancers
router.get("/freelancers", auth, cacheMiddleware(60), async (req, res) => {
  try {
    const canBrowseFreelancers =
      (Array.isArray(req.user.roles) &&
        req.user.roles.some((role) => role === "client" || role === "admin")) ||
      req.user.currentRole === "client" ||
      req.user.currentRole === "admin";

    if (!canBrowseFreelancers) {
      return res.status(403).json({
        message:
          "Only clients can browse freelancers. Switch to your client account or add a client role.",
        userRoles: req.user.roles,
        currentRole: req.user.currentRole,
      });
    }

    const { page, limit, skip, meta } = parsePagination(req.query, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    const filter = {
      roles: { $in: ["freelancer"] },
      isActive: { $ne: false },
    };

    if (req.query.search) {
      const s = String(req.query.search).trim().slice(0, 100);
      if (s) {
        const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [
          { "profile.firstName": regex },
          { "profile.lastName": regex },
          { "profile.primarySkill": regex },
          { "profile.location": regex },
          { email: regex },
        ];
      }
    }

    const [freelancers, total] = await Promise.all([
      User.find(filter)
        .select("email profile roles currentRole createdAt isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      freelancers,
      pagination: meta(total),
    });
  } catch (error) {
    console.error("Error listing freelancers:", error);
    res.status(500).json({ message: "Failed to fetch freelancers", error: error.message });
  }
});

// GET /api/users/clients
router.get("/clients", auth, requireRole(["admin", "freelancer"], false), cacheMiddleware(60), async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { page, limit, skip, meta } = parsePagination(req.query, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    const filter = {
      roles: { $in: ["client"] },
      isActive: true,
      _id: { $ne: requesterId },
    };

    if (req.query.search) {
      const s = String(req.query.search).trim().slice(0, 100);
      if (s) {
        const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [
          { "profile.firstName": regex },
          { "profile.lastName": regex },
          { email: regex },
        ];
      }
    }

    const [clients, total] = await Promise.all([
      User.find(filter)
        .select("email profile roles currentRole createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = clients.map((c) => c._id);
    const companies = await Company.find({ userId: { $in: userIds } })
      .select("userId companyName logo description industry")
      .lean();

    const companyByUser = new Map(companies.map((c) => [String(c.userId), c]));
    const enhancedClients = attachCompanies(clients, companyByUser);

    res.json({
      clients: enhancedClients,
      pagination: meta(total),
    });
  } catch (error) {
    console.error("Error listing clients:", error);
    res.status(500).json({ message: "Failed to fetch clients", error: error.message });
  }
});

router.delete("/freelancers/:id", auth, async (req, res) => {
  try {
    const freelancer = await User.findByIdAndDelete(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }
    await invalidatePattern("cache:/api/users/freelancers*");
    res.json({ message: "Freelancer deleted successfully", freelancer: freelancer._id });
  } catch (error) {
    console.error("Error deleting freelancer:", error);
    res.status(500).json({ message: "Failed to delete freelancer", error: error.message });
  }
});

// GET /api/users/public/profile/:idOrSlug
// @desc    Get public profile of user (freelancer or client) by ID or slug without authentication
// @access  Public
router.get("/public/profile/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let query = { slug: idOrSlug };

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
    }

    const user = await User.findOne(query)
      .select("email profile roles currentRole createdAt slug seo")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Expose only safe data
    const publicProfile = {
      _id: user._id,
      slug: user.slug,
      roles: user.roles,
      currentRole: user.currentRole,
      createdAt: user.createdAt,
      seo: user.seo,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        location: user.profile?.location,
        bio: user.profile?.bio,
        skills: user.profile?.skills,
        primarySkill: user.profile?.primarySkill,
        experienceLevel: user.profile?.experienceLevel,
        yearsOfExperience: user.profile?.yearsOfExperience,
        portfolioUrl: user.profile?.portfolioUrl,
        certifications: user.profile?.certifications,
        cvUrl: user.profile?.cvUrl,
        availability: user.profile?.availability,
        monthlyRate: user.profile?.monthlyRate,
        currency: user.profile?.currency,
        preferredJobTypes: user.profile?.preferredJobTypes,
        workLocation: user.profile?.workLocation,
        linkedinUrl: user.profile?.linkedinUrl,
        githubUrl: user.profile?.githubUrl,
        websiteUrl: user.profile?.websiteUrl,
        avatar: user.profile?.avatar,
      }
    };

    if (user.roles?.includes("client")) {
      const Job = require("../models/Job");
      const [company, jobs] = await Promise.all([
        Company.findOne({ userId: user._id })
          .select("companyName logo description industry website location")
          .lean(),
        Job.find({ postedBy: user._id, isActive: true, approved: true })
          .select("title budget category jobType workLocation deadline createdAt")
          .lean()
      ]);
      if (company) {
        publicProfile.companyProfile = company;
      }
      publicProfile.jobs = jobs;
    }

    // Fetch freelancer's projects & similar freelancers if they are a freelancer
    if (user.roles?.includes("freelancer")) {
      const [projects, similarFreelancers] = await Promise.all([
        Project.find({ freelancer: user._id }).lean(),
        User.find({
          "profile.primarySkill": user.profile.primarySkill,
          slug: { $ne: user.slug },
          roles: { $in: ["freelancer"] },
          isActive: { $ne: false }
        })
          .limit(5)
          .select("email profile slug createdAt")
          .lean()
      ]);
      publicProfile.projects = projects;
      publicProfile.similarFreelancers = similarFreelancers;
    }

    res.json({ user: publicProfile });
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("email profile roles currentRole createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.roles?.includes("client")) {
      const company = await Company.findOne({ userId: user._id })
        .select("companyName logo description industry website location")
        .lean();
      if (company) {
        user.companyProfile = company;
      }
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

// GET /api/users/by-telegram/:telegramId
// @desc    Get user by Telegram ID (for bot-to-web sync)
// @access  Public (used by Telegram bot with server-side auth)
router.get("/by-telegram/:telegramId", async (req, res) => {
  try {
    const telegramId = parseInt(req.params.telegramId, 10);
    if (isNaN(telegramId)) {
      return res.status(400).json({ message: "Invalid Telegram ID" });
    }

    const user = await User.findOne({ "telegram.id": telegramId })
      .select("email profile roles currentRole createdAt telegram slug")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found for this Telegram ID" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user by Telegram ID:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

module.exports = router;
