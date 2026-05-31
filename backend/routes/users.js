
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Company = require("../models/Company");
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

module.exports = router;
