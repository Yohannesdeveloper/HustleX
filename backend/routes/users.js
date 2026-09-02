
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// GET /api/users/freelancers - list all freelancers who have created accounts
router.get("/freelancers", auth, async (req, res) => {
  try {
    // Get all freelancers - include all users with freelancer role
    // Only exclude users explicitly marked as inactive (isActive: false)
    const freelancers = await User.find({
      roles: { $in: ["freelancer"] },
      isActive: { $ne: false } // Include all except explicitly inactive
    })
    .select("email profile roles currentRole createdAt isActive")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

    console.log(`Found ${freelancers.length} freelancers`);
    res.json({ freelancers: freelancers || [] });
  } catch (error) {
    console.error("Error listing freelancers:", error);
    res.status(500).json({ message: "Failed to fetch freelancers", error: error.message });
  }
});

// GET /api/users/clients - list all clients who have created accounts
router.get("/clients", auth, async (req, res) => {
  try {
    // "Available" clients: any active user with client role.
    // Exclude the requester if they also have client role to avoid self in list.
    const requesterId = req.user._id;

    const clients = await User.find({
      roles: { $in: ["client"] },
      isActive: true,
      _id: { $ne: requesterId },
    })
      .select("email profile roles currentRole createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Enhance clients with company profile information
    const Company = require("../models/Company");
    console.log("Processing clients:", clients.length);
    const enhancedClients = await Promise.all(
      clients.map(async (client) => {
        try {
          console.log("Fetching company for client:", client._id);
          const company = await Company.findOne({ userId: client._id })
            .select("companyName logo description industry")
            .lean();
          
          console.log("Company found for client:", client._id, company ? "Yes" : "No");
          
          if (company) {
            const enhancedClient = {
              ...client,
              avatar: company.logo, // Use company logo as avatar
              companyProfile: {
                companyName: company.companyName,
                logo: company.logo,
                description: company.description,
                industry: company.industry
              }
            };
            console.log("Enhanced client:", enhancedClient);
            return enhancedClient;
          }
          console.log("No company profile for client:", client._id);
          return client;
        } catch (error) {
          console.error("Error fetching company profile for client:", client._id, error);
          return client;
        }
      })
    );

    res.json({ clients: enhancedClients || [] });
  } catch (error) {
    console.error("Error listing clients:", error);
    res.status(500).json({ message: "Failed to fetch clients", error: error.message });
  }
});

// GET /api/users/:id - get a specific user's profile by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("email profile roles currentRole createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is a client, also fetch their company profile
    let companyProfile = null;
    if (user.currentRole === 'client') {
      const Company = require("../models/Company");
      companyProfile = await Company.findOne({ userId: id })
        .select("companyName logo description industry website tradeLicense")
        .lean();
    }

    res.json({ 
      user: {
        ...user,
        companyProfile
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
});

// DELETE /api/users/freelancers/:id - delete a freelancer (admin only)
router.delete("/freelancers/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin (you might want to add admin role check)
    // For now, allowing authenticated users to delete freelancers

    const freelancer = await User.findByIdAndDelete(id);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    res.json({ message: "Freelancer deleted successfully", freelancer: freelancer._id });
  } catch (error) {
    console.error("Error deleting freelancer:", error);
    res.status(500).json({ message: "Failed to delete freelancer", error: error.message });
  }
});

module.exports = router;
