const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { sendMail } = require("../services/mail");
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");
const { ensureAdminRole, toAuthUserPayload } = require("../config/admin");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/),
    body("firstName").optional().isString().trim(),
    body("lastName").optional().isString().trim(),
    body("role").optional().isIn(["freelancer", "client"]),
    body("roles").optional().isArray(),
    body("roles.*").optional().isIn(["freelancer", "client"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, roles, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Support both single role (backward compatibility) and multiple roles
      let userRoles = [];
      if (roles && Array.isArray(roles) && roles.length > 0) {
        userRoles = roles;
      } else if (role) {
        userRoles = [role];
      } else {
        return res.status(400).json({ message: "At least one role is required" });
      }

      // Create new user with multiple role support
      const user = new User({
        email,
        password,
        roles: userRoles,
        currentRole: userRoles[0], // Set first role as current
        profile: {
          firstName: firstName || '',
          lastName: lastName || '',
        },
      });

      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          roles: user.roles,
          currentRole: user.currentRole,
          role: user.currentRole, // For backward compatibility
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }


      const token = generateToken(user._id);

      // Auto-promote designated admin email to admin role
      await ensureAdminRole(user);

      // Check if user has a company profile (for client role)
      let hasCompanyProfile = false;
      if (user.currentRole === "client") {
        const company = await Company.findOne({ userId: user._id });
        hasCompanyProfile = !!company;
      }

      res.json({
        token,
        user: toAuthUserPayload(user, { hasCompanyProfile }),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/auth/send-otp
// @desc    Send password reset OTP to user's email
// @access  Public
router.post(
  "/send-otp",
  [body("email").isEmail().normalizeEmail(), body("otp").optional().isString()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      let { otp } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate OTP server-side if not provided by client
      if (!otp) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Save OTP and expiry (10 minutes)
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendMail({
        to: email,
        subject: "Your password reset OTP",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
        priority: "high",
      });

      return res.json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("Send OTP error:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify password reset OTP
// @access  Public
router.post(
  "/verify-otp",
  [body("email").isEmail().normalizeEmail(), body("otp").isLength({ min: 6, max: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.otp || !user.otpExpires) {
        return res.status(400).json({ message: "No OTP requested" });
      }

      if (new Date() > new Date(user.otpExpires)) {
        return res.status(400).json({ message: "OTP has expired" });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      return res.json({ message: "OTP verified" });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({ message: "Failed to verify OTP" });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using email + OTP
// @access  Public
router.post(
  "/reset-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }),
    body("newPassword").isLength({ min: 8 }).matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.otp || !user.otpExpires) {
        return res.status(400).json({ message: "No OTP requested" });
      }

      if (new Date() > new Date(user.otpExpires)) {
        return res.status(400).json({ message: "OTP has expired" });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Update password and clear OTP
      user.password = newPassword;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Failed to reset password" });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // Auto-promote designated admin email to admin role
    await ensureAdminRole(req.user);

    // Check if user has a company profile (for client role)
    let hasCompanyProfile = false;
    if (req.user.currentRole === "client") {
      const company = await Company.findOne({ userId: req.user._id });
      hasCompanyProfile = !!company;
    }

    res.json({
      user: toAuthUserPayload(req.user, { hasCompanyProfile }),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user's profile fields
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "skills",
      "experience",
      "education",
      "bio",
      "avatar",
    ];

    const updates = req.body?.profile || {};
    const profile = req.user.profile || {};

    allowedFields.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        profile[key] = updates[key];
      }
    });

    req.user.profile = profile;
    await req.user.save();

    return res.json({
      message: "Profile updated",
      user: {
        _id: req.user._id,
        email: req.user.email,
        roles: req.user.roles,
        currentRole: req.user.currentRole,
        role: req.user.currentRole,
        profile: req.user.profile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/switch-role
// @desc    Switch current user role
// @access  Private
router.post("/switch-role", auth, [
  body("role").isIn(["freelancer", "client"])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    // Check if user has this role
    if (!req.user.roles.includes(role)) {
      return res.status(400).json({ message: "User does not have this role" });
    }

    // Update current role
    req.user.currentRole = role;
    await req.user.save();

    // Check if user has a company profile (for client role)
    let hasCompanyProfile = false;
    if (role === "client") {
      const company = await Company.findOne({ userId: req.user._id });
      hasCompanyProfile = !!company;
    }

    res.json({
      message: "Role switched successfully",
      user: {
        _id: req.user._id,
        email: req.user.email,
        roles: req.user.roles,
        currentRole: req.user.currentRole,
        role: req.user.currentRole, // For backward compatibility
        profile: req.user.profile,
        hasCompanyProfile, // For client profile completion check
      },
    });
  } catch (error) {
    console.error("Switch role error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/add-role
// @desc    Add a new role to user
// @access  Private
router.post("/add-role", auth, [
  body("role").isIn(["freelancer", "client"])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    // Check if user already has this role
    if (req.user.roles.includes(role)) {
      return res.status(400).json({ message: "User already has this role" });
    }

    // Add new role
    req.user.roles.push(role);
    await req.user.save();

    // Check if user has a company profile (for client role)
    let hasCompanyProfile = false;
    if (role === "client") {
      const company = await Company.findOne({ userId: req.user._id });
      hasCompanyProfile = !!company;
    }

    res.json({
      message: "Role added successfully",
      user: {
        _id: req.user._id,
        email: req.user.email,
        roles: req.user.roles,
        currentRole: req.user.currentRole,
        role: req.user.currentRole, // For backward compatibility
        profile: req.user.profile,
        hasCompanyProfile, // For client profile completion check
      },
    });
  } catch (error) {
    console.error("Add role error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/check-user
// @desc    Check if user exists by email
// @access  Public
router.get("/check-user", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        role: user.currentRole, // For backward compatibility
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/freelancer-profile
// @desc    Save freelancer profile data
// @access  Private
router.post("/freelancer-profile", auth, async (req, res) => {
  try {
    const profileData = req.body.profile;

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    // Update user profile with freelancer-specific data
    // Use merge semantics: only overwrite fields that have a meaningful value
    // so that re-submitting the wizard doesn't erase previously saved data.
    const profile = req.user.profile || {};

    // Helper: set only when incoming value is non-empty
    const setIfPresent = (key, value) => {
      if (value !== undefined && value !== null && value !== "") {
        profile[key] = value;
      }
    };

    // Helper: set array only when it has items
    const setArrayIfPresent = (key, value) => {
      if (Array.isArray(value) && value.length > 0) {
        profile[key] = value;
      }
    };

    // Basic information (always overwrite — these are required)
    profile.firstName = profileData.firstName;
    profile.lastName = profileData.lastName;
    setIfPresent("phone", profileData.phone);
    setIfPresent("location", profileData.location);
    setIfPresent("bio", profileData.bio);
    setIfPresent("education", profileData.education);
    setIfPresent("experience", profileData.experience || profileData.workExperience);
    setIfPresent("workExperience", profileData.workExperience || profileData.experience);

    // Skills & expertise
    setArrayIfPresent("skills", profileData.skills);
    setIfPresent("primarySkill", profileData.primarySkill);
    setIfPresent("experienceLevel", profileData.experienceLevel);

    // Experience & portfolio
    setIfPresent("yearsOfExperience", profileData.yearsOfExperience);
    setIfPresent("portfolioUrl", profileData.portfolioUrl);
    setArrayIfPresent("certifications", profileData.certifications);

    // Availability & rates
    setIfPresent("availability", profileData.availability);
    setIfPresent("monthlyRate", profileData.monthlyRate);
    setIfPresent("currency", profileData.currency);
    setArrayIfPresent("preferredJobTypes", profileData.preferredJobTypes);
    setIfPresent("workLocation", profileData.workLocation);

    // Social links
    setIfPresent("linkedinUrl", profileData.linkedinUrl);
    setIfPresent("githubUrl", profileData.githubUrl);
    setIfPresent("websiteUrl", profileData.websiteUrl);
    setIfPresent("cvUrl", profileData.cvUrl);

    // Avatar
    setIfPresent("avatar", profileData.avatar);

    // Mark profile as complete
    profile.isProfileComplete = true;
    profile.profileCompletedAt = new Date();

    req.user.profile = profile;
    await req.user.save();

    // Emit WebSocket event to notify all clients about freelancer profile update
    const io = req.app.get('io');
    if (io) {
      io.emit('freelancer_profile_updated', {
        freelancerId: req.user._id,
        profile: req.user.profile,
        updatedAt: new Date()
      });
      console.log(`Emitted freelancer profile update for user ${req.user._id}`);
    }

    res.json({
      message: "Freelancer profile saved successfully",
      user: {
        _id: req.user._id,
        email: req.user.email,
        roles: req.user.roles,
        currentRole: req.user.currentRole,
        role: req.user.currentRole, // For backward compatibility
        profile: req.user.profile,
      },
    });
  } catch (error) {
    console.error("Save freelancer profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/telegram-login
// @desc    Login with Telegram
// @access  Public
router.post("/telegram-login", async (req, res) => {
  try {
    const { telegramData } = req.body;
    
    if (!telegramData) {
      return res.status(400).json({ message: "Telegram data is required" });
    }

    // Verify Telegram data
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ message: "Telegram bot token not configured" });
    }

    // Create a copy to avoid modifying the original object
    const dataToCheck = { ...telegramData };
    const hash = dataToCheck.hash;
    delete dataToCheck.hash;

    // Sort the keys alphabetically
    const sortedKeys = Object.keys(dataToCheck).sort();
    
    // Create the data check string
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${dataToCheck[key]}`)
      .join("\n");

    // Create secret key from bot token using SHA256
    const secretKey = crypto.createHash("sha256").update(botToken).digest();

    // Calculate HMAC-SHA256
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(dataCheckString);
    const calculatedHash = hmac.digest("hex");

    // Check if hash matches
    if (calculatedHash !== hash) {
      return res.status(400).json({ message: "Invalid Telegram data" });
    }

    // Check auth date to prevent replay attacks (within 24 hours)
    const authDate = parseInt(telegramData.auth_date);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - authDate * 1000 > twentyFourHours) {
      return res.status(400).json({ message: "Telegram data expired" });
    }

    // Find or create user
    let user = await User.findOne({ "telegram.id": telegramData.id });

    if (!user) {
      // Create new user
      user = new User({
        telegram: {
          id: telegramData.id,
          username: telegramData.username,
          firstName: telegramData.first_name,
          lastName: telegramData.last_name,
          photoUrl: telegramData.photo_url,
        },
        roles: ["freelancer"],
        currentRole: "freelancer",
        profile: {
          firstName: telegramData.first_name || "",
          lastName: telegramData.last_name || "",
          avatar: telegramData.photo_url || "",
        },
      });
      
      // Generate a random password for security (even though we don't use it for login)
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user.password = randomPassword;

      await user.save();
    }

    // Generate token and return user
    const token = generateToken(user._id);
    await ensureAdminRole(user);

    res.json({
      token,
      user: toAuthUserPayload(user),
    });

  } catch (error) {
    console.error("Telegram login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/telegram-config
// @desc    Get Telegram configuration for frontend widget
// @access  Public
router.get("/telegram-config", (req, res) => {
  try {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    const isConfigured = !!(botUsername && botToken);
    
    res.json({
      botUsername,
      configured: isConfigured
    });
  } catch (error) {
    console.error("Get Telegram config error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
