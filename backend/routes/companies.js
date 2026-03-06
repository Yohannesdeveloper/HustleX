const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");

// Get company profile
router.get("/profile", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.json(company);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: "Failed to fetch company profile" });
  }
});

// Create or update company profile
router.post("/profile", auth, async (req, res) => {
  try {
    console.log("Received company profile data:", req.body);
    
    const {
      companyName,
      industry,
      companySize,
      website,
      location,
      description,
      contactEmail,
      contactPhone,
      foundedYear,
      logo,
      tradeLicense,
      verificationData,
      jobPositionAlternatives,
      taxId,
    } = req.body;

    // Validate required fields
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    // Validate foundedYear if provided
    if (foundedYear && (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > new Date().getFullYear())) {
      return res.status(400).json({
        message: "Invalid founded year",
      });
    }

    const updateData = {
      companyName: companyName.trim(),
      industry,
      companySize,
      website,
      location,
      description,
      contactEmail,
      contactPhone,
      foundedYear,
      logo,
      tradeLicense,
      verificationData,
      jobPositionAlternatives,
      taxId,
    };

    // Remove undefined and empty string fields (except for required companyName)
    Object.keys(updateData).forEach(key => {
      if (key !== 'companyName' && (updateData[key] === undefined || updateData[key] === '')) {
        delete updateData[key];
      }
    });

    console.log("Updating company with data:", updateData);
    
    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      { ...updateData, userId: req.user._id },
      { new: true, upsert: true }
    );
    
    console.log("Company updated successfully:", company);

    res.json({
      message: "Company profile updated successfully",
      company,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Company profile already exists for this user",
      });
    }
    
    res.status(500).json({
      message: "Failed to update company profile",
      error: error.message,
    });
  }
});

// Submit verification request
router.post("/verify", auth, async (req, res) => {
  try {
    const { representative } = req.body;

    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      {
        verificationStatus: "pending",
        verificationData: {
          representative,
          submittedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({
      message: "Verification request submitted successfully",
      company,
    });
  } catch (error) {
    console.error("Error submitting verification request:", error);
    res.status(500).json({
      message: "Failed to submit verification request",
      error: error.message,
    });
  }
});

// Add job position alternative
router.post("/job-alternatives", auth, async (req, res) => {
  try {
    const { title, category, skills } = req.body;

    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          jobPositionAlternatives: {
            title,
            category,
            skills: skills || [],
            isActive: true,
          },
        },
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({
      message: "Job position alternative added successfully",
      alternatives: company.jobPositionAlternatives,
    });
  } catch (error) {
    console.error("Error adding job position alternative:", error);
    res.status(500).json({
      message: "Failed to add job position alternative",
      error: error.message,
    });
  }
});

// Update job position alternative
router.put("/job-alternatives/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, skills, isActive } = req.body;

    const company = await Company.findOneAndUpdate(
      {
        userId: req.user._id,
        "jobPositionAlternatives._id": id,
      },
      {
        $set: {
          "jobPositionAlternatives.$.title": title,
          "jobPositionAlternatives.$.category": category,
          "jobPositionAlternatives.$.skills": skills || [],
          "jobPositionAlternatives.$.isActive": isActive,
        },
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile or job alternative not found" });
    }

    res.json({
      message: "Job position alternative updated successfully",
      alternatives: company.jobPositionAlternatives,
    });
  } catch (error) {
    console.error("Error updating job position alternative:", error);
    res.status(500).json({
      message: "Failed to update job position alternative",
      error: error.message,
    });
  }
});

// Delete job position alternative
router.delete("/job-alternatives/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      {
        $pull: {
          jobPositionAlternatives: { _id: id },
        },
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({
      message: "Job position alternative deleted successfully",
      alternatives: company.jobPositionAlternatives,
    });
  } catch (error) {
    console.error("Error deleting job position alternative:", error);
    res.status(500).json({
      message: "Failed to delete job position alternative",
      error: error.message,
    });
  }
});

// Update company stats
router.put("/stats", auth, async (req, res) => {
  try {
    const { totalJobs, activeJobs, totalApplications, hiredFreelancers } = req.body;

    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          "stats.totalJobs": totalJobs,
          "stats.activeJobs": activeJobs,
          "stats.totalApplications": totalApplications,
          "stats.hiredFreelancers": hiredFreelancers,
        },
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({
      message: "Company stats updated successfully",
      stats: company.stats,
    });
  } catch (error) {
    console.error("Error updating company stats:", error);
    res.status(500).json({
      message: "Failed to update company stats",
      error: error.message,
    });
  }
});

module.exports = router;
