const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { sendMail } = require("../services/mail");
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");
const { ensureAdminRole, toAuthUserPayload } = require("../config/admin");

const router = express.Router();

/** Strip all non-digit characters from a phone number for consistent storage/lookup */
function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

// ── Shared store for pending Telegram login confirmations (Redis with Local Fallback) ──
// We must not use in-memory Map solely because webhook callbacks can hit a different
// server instance (Railway/K8s). Redis ensures requestId correlation works.
// However, during local development or when Redis is disabled, we fall back to a local Map.
const { redisClient: getCacheRedisClient } = require("../middleware/cache");

const PENDING_TG_PREFIX = "telegram:login:pending:";
const PENDING_TG_TTL_SECONDS = 5 * 60; // 5 minutes

const localPendingLogins = new Map();

function getPendingKey(requestId) {
  return `${PENDING_TG_PREFIX}${requestId}`;
}

async function getPendingEntry(requestId) {
  const redis = getCacheRedisClient();
  if (!redis) {
    return localPendingLogins.get(requestId) || null;
  }
  try {
    const raw = await redis.get(getPendingKey(requestId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Telegram pendingEntry GET error:", e.message || e);
    return localPendingLogins.get(requestId) || null;
  }
}

async function setPendingEntry(requestId, entry) {
  const redis = getCacheRedisClient();
  if (!redis) {
    localPendingLogins.set(requestId, entry);
    // Auto-delete after 5 minutes to prevent leaks
    setTimeout(() => {
      localPendingLogins.delete(requestId);
    }, PENDING_TG_TTL_SECONDS * 1000);
    return;
  }
  try {
    await redis.setex(getPendingKey(requestId), PENDING_TG_TTL_SECONDS, JSON.stringify(entry));
  } catch (e) {
    console.error("Telegram pendingEntry SET error:", e.message || e);
    localPendingLogins.set(requestId, entry);
    setTimeout(() => {
      localPendingLogins.delete(requestId);
    }, PENDING_TG_TTL_SECONDS * 1000);
  }
}

async function deletePendingEntry(requestId) {
  const redis = getCacheRedisClient();
  if (!redis) {
    localPendingLogins.delete(requestId);
    return;
  }
  try {
    await redis.del(getPendingKey(requestId));
  } catch (e) {
    console.error("Telegram pendingEntry DEL error:", e.message || e);
    localPendingLogins.delete(requestId);
  }
}


// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Send a Telegram message to a chat via the bot API.
 * Silently catches errors so it never breaks the request flow.
 */
async function sendTelegramNotification(chatId, text) {
  const botToken = process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !chatId) return;
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.warn("Telegram notification failed:", err?.response?.data || err.message);
  }
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").optional().isLength({ min: 8 }).matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/),
    body("firstName").optional().isString().trim(),
    body("lastName").optional().isString().trim(),
    body("dateOfBirth").optional().isString().trim(),
    body("gender").optional().isString().trim(),
    body("country").optional().isString().trim(),
    body("city").optional().isString().trim(),
    body("role").optional().isIn(["freelancer", "client"]),
    body("roles").optional().isArray(),
    body("roles.*").optional().isIn(["freelancer", "client"]),
    body("telegram.id").optional().isNumeric(),
    body("telegram.username").optional().isString(),
    body("telegram.firstName").optional().isString(),
    body("telegram.lastName").optional().isString(),
    body("telegram.photoUrl").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, roles, firstName, lastName, dateOfBirth, gender, country, city, telegram } = req.body;

      // Mini App: if this Telegram account is already registered, log them in
      if (telegram?.id) {
        const existingByTelegram = await User.findOne({ "telegram.id": telegram.id });
        if (existingByTelegram) {
          const token = generateToken(existingByTelegram._id);
          await ensureAdminRole(existingByTelegram);
          return res.status(200).json({
            token,
            user: toAuthUserPayload(existingByTelegram),
          });
        }
      }

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
      }

      // Build user fields
      const userFields = {
        email,
        password: password || undefined,
        profile: {
          firstName: firstName || '',
          lastName: lastName || '',
          dateOfBirth: dateOfBirth || '',
          gender: gender || '',
          country: country || '',
          city: city || '',
        },
      };

      if (userRoles.length > 0) {
        userFields.roles = userRoles;
        userFields.currentRole = userRoles[0];
      }

      // Attach Telegram data if provided
      if (telegram && telegram.id) {
        userFields.telegram = {
          id: telegram.id,
          username: telegram.username || '',
          firstName: telegram.firstName || '',
          lastName: telegram.lastName || '',
          photoUrl: telegram.photoUrl || '',
        };
      }

      // Create new user
      const user = new User(userFields);

      await user.save();

      const token = generateToken(user._id);

      // ── Send Telegram notification ──
      // Disabled admin channel notifications
      // const safeName = firstName || email;
      // const regMsg = [
      //   `🆕 <b>New User Registered!</b>`,
      //   ``,
      //   `👤 <b>Name:</b> ${safeName} ${lastName || ''}`,
      //   `📧 <b>Email:</b> ${email}`,
      //   `🌍 <b>Country:</b> ${country || '—'}`,
      //   `🏙️ <b>City:</b> ${city || '—'}`,
      //   `🎂 <b>DOB:</b> ${dateOfBirth || '—'}`,
      //   `⚧️ <b>Gender:</b> ${gender || '—'}`,
      // ].join("\n");

      // Notify admin (TELEGRAM_CHAT_ID = your user ID)
      // if (process.env.TELEGRAM_CHAT_ID) {
      //   sendTelegramNotification(process.env.TELEGRAM_CHAT_ID, regMsg);
      // }

      // Welcome the user if they registered via Telegram Mini App
      // Disabled welcome message
      // if (user.telegram && user.telegram.id) {
      //   const welcomeMsg = [
      //     `🎉 <b>Welcome to HustleX, ${firstName || 'there'}!</b>`,
      //     ``,
      //     `Your account has been created successfully.`,
      //     `Complete your freelancer profile to start applying for jobs.`,
      //     ``,
      //     `🌐 <a href="https://hustlexet.vercel.app/freelancer-profile-setup">Complete Profile</a>`,
      //     ``,
      //     `💼 <b>HustleX</b> — Connecting Talent with Opportunity`,
      //   ].join("\n");

      //   sendTelegramNotification(user.telegram.id, welcomeMsg);
      // }

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

// @route   POST /api/auth/select-role
// @desc    Set or change the user's active role (freelancer / client / admin)
// @access  Private
router.post(
  "/select-role",
  [body("role").isIn(["freelancer", "client", "admin"])],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const user = req.user;

      // Admin role: only designated admin accounts can select it
      if (role === "admin") {
        const { isDesignatedAdminEmail } = require("../config/admin");
        if (!isDesignatedAdminEmail(user.email) && !user.roles?.includes("admin")) {
          return res.status(403).json({ message: "You are not authorized to access admin features." });
        }
      }

      // Add role to user.roles if not already present
      if (!user.roles) user.roles = [];
      if (!user.roles.includes(role)) {
        user.roles.push(role);
      }
      user.currentRole = role;
      await user.save();

      const hasCompanyProfile = !!(await Company.findOne({ owner: user._id }));
      res.json({ user: toAuthUserPayload(user, { hasCompanyProfile }) });
    } catch (error) {
      console.error("Select role error:", error);
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

      // Check if user has a password set
      if (!user.password) {
        return res.status(400).json({ message: "This account doesn't have a password set. Please login via Telegram or set a password." });
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

// @route   POST /api/auth/set-password
// @desc    Set password for existing user who doesn't have one
// @access  Public
router.post(
  "/set-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set password
      user.password = password;
      await user.save();

      return res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Set password error:", error);
      return res.status(500).json({ message: "Server error" });
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

// @route   PUT /api/auth/profile-draft
// @desc    Save freelancer profile draft
// @access  Private
router.put("/profile-draft", auth, async (req, res) => {
  try {
    req.user.profileDraft = req.body.draft || {};
    await req.user.save();
    res.json({ message: "Draft saved successfully" });
  } catch (error) {
    console.error("Save profile draft error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/profile-draft
// @desc    Get freelancer profile draft
// @access  Private
router.get("/profile-draft", auth, async (req, res) => {
  try {
    res.json({ draft: req.user.profileDraft || {} });
  } catch (error) {
    console.error("Get profile draft error:", error);
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
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/freelancer-profile
// @desc    Save freelancer profile data
// @access  Public (for bot access)
router.post("/freelancer-profile", async (req, res) => {
  try {
    const profileData = req.body.profile;

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    // Find or create user based on email
    let user = await User.findOne({ email: profileData.email });

    if (!user) {
      // Create a new user for bot submissions
      user = new User({
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        roles: ['freelancer'],
        currentRole: 'freelancer',
        isVerified: true, // Auto-verify bot submissions
      });
    }

    // Update user profile with freelancer-specific data
    // Use merge semantics: only overwrite fields that have a meaningful value
    // so that re-submitting the wizard doesn't erase previously saved data.
    const profile = user.profile || {};

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

    user.profile = profile;
    await user.save();

    // Emit WebSocket event to notify all clients about freelancer profile update
    const io = req.app.get('io');
    if (io) {
      io.emit('freelancer_profile_updated', {
        freelancerId: user._id,
        profile: user.profile,
        updatedAt: new Date()
      });
      console.log(`Emitted freelancer profile update for user ${user._id}`);
    }

    // Notify the admin (you) about profile completion
    // Disabled admin channel notifications
    // if (process.env.TELEGRAM_CHAT_ID) {
    //   const firstName = profileData.firstName || user.profile?.firstName || 'Unknown';
    //   const adminMsg = [
    //     `✅ <b>Freelancer Profile Completed!</b>`,
    //     ``,
    //     `👤 <b>Name:</b> ${firstName} ${profileData.lastName || ''}`,
    //     `📧 <b>Email:</b> ${profileData.email}`,
    //     `📱 <b>Phone:</b> ${profileData.phone || '—'}`,
    //     `📍 <b>Location:</b> ${profileData.location || '—'}`,
    //     `💼 <b>Skills:</b> ${Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '—'}`,
    //     `⭐ <b>Level:</b> ${profileData.experienceLevel || '—'}`,
    //   ].join("\n");

    //   sendTelegramNotification(process.env.TELEGRAM_CHAT_ID, adminMsg);
    // }

    // Notify the user on Telegram about profile completion
    if (user.telegram && user.telegram.id) {
      const firstName = profileData.firstName || user.profile?.firstName || 'there';
      const userMsg = [
        `✅ <b>Freelancer Profile Completed!</b>`,
        ``,
        `Hi <b>${firstName}</b>!`,
        `Your freelancer profile has been completed successfully. You can now start applying for jobs.`,
        ``,
        `🌐 <a href="https://hustlexet.vercel.app">Open HustleX</a>`,
        ``,
        `💼 <b>HustleX</b> — Connecting Talent with Opportunity`,
      ].join("\n");

      sendTelegramNotification(user.telegram.id, userMsg);
    }

    res.json({
      message: "PROFILE SAVED SUCCESSFULLY",
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
    console.error("Save freelancer profile error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors,
      stack: error.stack
    });
    // Handle duplicate key errors
    if (error.code === 11000) {
      const keyPattern = error.keyPattern;
      let message = "A unique constraint was violated";
      if (keyPattern.email) {
        message = "This email is already registered";
      }
      return res.status(400).json({ message });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/profile/freelancer
// @desc    Save freelancer profile (authenticated — uses JWT user, not email lookup)
// @access   Private
router.post("/profile/freelancer", auth, [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("phone").optional({ values: "falsy" }).trim(),
  body("location").optional({ values: "falsy" }).trim(),
  body("bio").optional({ values: "falsy" }).trim(),
  body("education").optional({ values: "falsy" }).trim(),
  body("experience").optional({ values: "falsy" }).trim(),
  body("skills").optional().isArray(),
  body("primarySkill").optional({ values: "falsy" }).trim(),
  body("experienceLevel").optional({ values: "falsy" }).trim(),
  body("yearsOfExperience").optional({ values: "falsy" }).trim(),
  body("portfolioUrl").optional({ values: "falsy" }).trim(),
  body("certifications").optional().isArray(),
  body("availability").optional({ values: "falsy" }).trim(),
  body("monthlyRate").optional({ values: "falsy" }).trim(),
  body("currency").optional({ values: "falsy" }).trim(),
  body("preferredJobTypes").optional().isArray(),
  body("workLocation").optional({ values: "falsy" }).trim(),
  body("linkedinUrl").optional({ values: "falsy" }).trim(),
  body("githubUrl").optional({ values: "falsy" }).trim(),
  body("websiteUrl").optional({ values: "falsy" }).trim(),
  body("cvUrl").optional({ values: "falsy" }).trim(),
  body("avatar").optional({ values: "falsy" }).trim(),
], async (req, res) => {
  try {
    console.log("POST /api/auth/profile/freelancer - Request body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("POST /api/auth/profile/freelancer - Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, location, bio, education, experience, skills, primarySkill, experienceLevel, yearsOfExperience, portfolioUrl, certifications, availability, monthlyRate, currency, preferredJobTypes, workLocation, linkedinUrl, githubUrl, websiteUrl, cvUrl, avatar } = req.body;

    const profile = req.user.profile || {};

    profile.firstName = firstName;
    profile.lastName = lastName;
    if (email) {
      profile.email = email;
    } else {
      delete profile.email;
    }
    if (phone) {
      profile.phone = phone;
    } else {
      delete profile.phone;
    }
    if (location) {
      profile.location = location;
    } else {
      delete profile.location;
    }
    if (bio) {
      profile.bio = bio;
    } else {
      delete profile.bio;
    }
    if (education) {
      profile.education = education;
    } else {
      delete profile.education;
    }
    if (experience) {
      profile.experience = experience;
    } else {
      delete profile.experience;
    }
    profile.skills = Array.isArray(skills) ? skills : (profile.skills || []);
    if (primarySkill) {
      profile.primarySkill = primarySkill;
    } else {
      delete profile.primarySkill;
    }
    if (experienceLevel) {
      profile.experienceLevel = experienceLevel;
    } else {
      delete profile.experienceLevel;
    }
    if (yearsOfExperience) {
      profile.yearsOfExperience = yearsOfExperience;
    } else {
      delete profile.yearsOfExperience;
    }
    if (portfolioUrl) {
      profile.portfolioUrl = portfolioUrl;
    } else {
      delete profile.portfolioUrl;
    }
    profile.certifications = Array.isArray(certifications) ? certifications : (profile.certifications || []);
    if (availability) {
      profile.availability = availability;
    } else {
      delete profile.availability;
    }
    if (monthlyRate) {
      profile.monthlyRate = monthlyRate;
    } else {
      delete profile.monthlyRate;
    }
    if (currency) {
      profile.currency = currency;
    } else {
      delete profile.currency;
    }
    profile.preferredJobTypes = Array.isArray(preferredJobTypes) ? preferredJobTypes : (profile.preferredJobTypes || []);
    if (workLocation) {
      profile.workLocation = workLocation;
    } else {
      delete profile.workLocation;
    }
    if (linkedinUrl) {
      profile.linkedinUrl = linkedinUrl;
    } else {
      delete profile.linkedinUrl;
    }
    if (githubUrl) {
      profile.githubUrl = githubUrl;
    } else {
      delete profile.githubUrl;
    }
    if (websiteUrl) {
      profile.websiteUrl = websiteUrl;
    } else {
      delete profile.websiteUrl;
    }
    if (cvUrl) {
      profile.cvUrl = cvUrl;
    } else {
      delete profile.cvUrl;
    }
    if (avatar) {
      profile.avatar = avatar;
    } else {
      delete profile.avatar;
    }
    profile.isProfileComplete = true;
    profile.profileCompletedAt = new Date();

    req.user.profile = profile;
    console.log("POST /api/auth/profile/freelancer - User before save:", req.user.toObject());
    await req.user.save();
    console.log("POST /api/auth/profile/freelancer - User saved successfully");

    const io = req.app.get('io');
    if (io) {
      io.emit('freelancer_profile_updated', {
        freelancerId: req.user._id,
        profile: req.user.profile,
        updatedAt: new Date()
      });
    }

    // Notify user about profile completion
    if (req.user.telegram && req.user.telegram.id) {
      const firstName = profile.firstName || 'there';
      const userMsg = [
        `✅ <b>Freelancer Profile Completed!</b>`,
        ``,
        `Hi <b>${firstName}</b>!`,
        `Your freelancer profile has been completed successfully. You can now start applying for jobs.`,
        ``,
        `🌐 <a href="https://hustlexet.vercel.app">Open HustleX</a>`,
        ``,
        `💼 <b>HustleX</b> — Connecting Talent with Opportunity`,
      ].join("\n");
      sendTelegramNotification(req.user.telegram.id, userMsg);
    }

    res.json({
      message: "Freelancer profile saved successfully",
      user: toAuthUserPayload(req.user),
    });
  } catch (error) {
    console.error("Save freelancer profile (authenticated) error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors,
      stack: error.stack
    });
    // Handle duplicate key errors
    if (error.code === 11000) {
      const keyPattern = error.keyPattern;
      let message = "A unique constraint was violated";
      if (keyPattern.email) {
        message = "This email is already registered";
      }
      return res.status(400).json({ message });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/profile/freelancer
// @desc    Get freelancer profile for the authenticated user
// @access  Private
router.get("/profile/freelancer", auth, async (req, res) => {
  try {
    const profile = req.user.profile || {};
    res.json({ profile });
  } catch (error) {
    console.error("Get freelancer profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/telegram-login
// @desc    Initiate Telegram login – sends a confirm/decline notification
// @access  Public
router.post("/telegram-login", async (req, res) => {
  try {
    const { telegramData, initData } = req.body;

    // Accept either `telegramData` (flat object, Login Widget) or
    // `initData` (raw query string, Mini App).
    const botToken = process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ message: "Telegram bot token not configured" });
    }

    let flatUser;       // user info extracted from the verified data
    let queryHash;      // the hash from the data

    if (initData && typeof initData === 'string') {
      // ── Mini App format: raw query string ──
      // Parse with URLSearchParams to get URL-decoded values, matching
      // Telegram's official validation algorithm (@telegram-apps/init-data-node).
      const sp = new URLSearchParams(initData);
      queryHash = sp.get('hash') || '';

      // Build sorted key=value pairs (URL-decoded), excluding hash
      const pairs = [];
      sp.forEach((value, key) => {
        if (key === 'hash') return;
        pairs.push(`${key}=${value}`);
      });
      pairs.sort();
      const dataCheckString = pairs.join('\n');

      // secretKey = HMAC-SHA256(key="WebAppData", data=botToken) for Mini App.
      // (SHA256(botToken) is only used by Login Widget.)
      const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
      const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
      console.log("[TelegramLogin] MiniApp dataCheckString:", JSON.stringify(dataCheckString));
      console.log("[TelegramLogin] MiniApp computed hash:", computedHash);
      console.log("[TelegramLogin] MiniApp expected hash:", queryHash);
      if (computedHash !== queryHash) {
        return res.status(400).json({ message: "Invalid Telegram data" });
      }

      const authDate = parseInt(sp.get('auth_date') || '0');
      if (Date.now() - authDate * 1000 > 24 * 60 * 60 * 1000) {
        return res.status(400).json({ message: "Telegram data expired" });
      }

      // Extract user from the JSON-encoded `user` param (already URL-decoded)
      const rawUser = sp.get('user');
      if (!rawUser) return res.status(400).json({ message: "User data missing" });
      flatUser = JSON.parse(rawUser);
    } else if (telegramData) {
      // ── Login Widget format: flat object ──
      const dataToCheck = { ...telegramData };
      queryHash = dataToCheck.hash;
      delete dataToCheck.hash;

      const sortedKeys = Object.keys(dataToCheck).sort();
      const dataCheckString = sortedKeys.map((k) => `${k}=${dataToCheck[k]}`).join("\n");

      const secretKey = crypto.createHash("sha256").update(botToken).digest();
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(dataCheckString);
      if (hmac.digest("hex") !== queryHash) {
        return res.status(400).json({ message: "Invalid Telegram data" });
      }

      const authDate = parseInt(telegramData.auth_date);
      if (Date.now() - authDate * 1000 > 24 * 60 * 60 * 1000) {
        return res.status(400).json({ message: "Telegram data expired" });
      }

      flatUser = telegramData;
    } else {
      return res.status(400).json({ message: "Telegram data is required" });
    }

    // ── 1) Find existing user by telegram.id ──
    let user = await User.findOne({ "telegram.id": flatUser.id });

    // ── 2) Fallback: try Telegram username ──
    if (!user && flatUser.username) {
      user = await User.findOne({ "telegram.username": flatUser.username });
      if (user) {
        console.log(`[TelegramLogin] Linked by username ${flatUser.username} → user ${user._id}`);
        user.telegram.id = flatUser.id;
        await user.save();
      }
    }

    // ── 3) Fallback: fetch phone from Telegram API & match by phone ──
    // Short timeout — this only helps link web-registered users who don't
    // have telegram.id stored.  For new Mini App users we'll return
    // needsRegistration, so don't wait long.
    if (!user) {
      try {
        const chatRes = await axios.get(
          `https://api.telegram.org/bot${botToken}/getChat?chat_id=${flatUser.id}`,
          { timeout: 1000 }
        );
        const tgPhoneRaw = chatRes.data?.ok ? chatRes.data.result?.phone_number : null;
        console.log("[TelegramLogin] getChat phone_number:", tgPhoneRaw || "(none)");

        if (tgPhoneRaw) {
          const tgPhone = normalizePhone(tgPhoneRaw);
          console.log("[TelegramLogin] normalized phone:", tgPhone);

          // Safe: normalizePhone strips all \D, so only digits remain — no injection risk.
          const phoneUsers = await User.find({
            $where: `this.profile.phone && (this.profile.phone.endsWith("${tgPhone}") || "${tgPhone}".endsWith(this.profile.phone))`
          }).limit(2);

          if (phoneUsers.length > 0) {
            user = phoneUsers[0];
            console.log(`[TelegramLogin] Found existing user ${user._id} by phone`);
            // Link the Telegram identity to the existing account
            user.telegram = {
              id: flatUser.id,
              username: flatUser.username || '',
              firstName: flatUser.first_name || '',
              lastName: flatUser.last_name || '',
              photoUrl: flatUser.photo_url || '',
            };
            await user.save();
          } else {
            console.log("[TelegramLogin] No user found for that phone — will create new");
          }
        }
      } catch (chatErr) {
        console.error("[TelegramLogin] getChat failed:", chatErr?.response?.data || chatErr.message);
      }
    }

    // ── 4) Still nothing?  Try email/password login to link existing account ──
    if (!user) {
      const { email, password } = req.body;
      if (email && password) {
        const emailUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (emailUser && (await emailUser.comparePassword(password))) {
          console.log(`[TelegramLogin] Linking telegram.id ${flatUser.id} to existing user ${emailUser._id}`);
          emailUser.telegram = {
            id: flatUser.id,
            username: flatUser.username || '',
            firstName: flatUser.first_name || '',
            lastName: flatUser.last_name || '',
            photoUrl: flatUser.photo_url || '',
          };
          await emailUser.save();
          const token = generateToken(emailUser._id);
          await ensureAdminRole(emailUser);
          return res.json({ token, user: toAuthUserPayload(emailUser) });
        }
        return res.status(400).json({ message: "Invalid email or password" });
      }

      console.log(`[TelegramLogin] No existing user for telegram.id ${flatUser.id} — needs registration`);
      return res.json({
        needsRegistration: true,
        telegramUser: flatUser,
      });
    }

    // Generate token
    const token = generateToken(user._id);
    await ensureAdminRole(user);

    // Data already verified by server-side HMAC check — auto-login
    return res.json({ token, user: toAuthUserPayload(user) });
  } catch (error) {
    console.error("Telegram login error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/telegram-login-status/:requestId
// @desc    Poll for Telegram login confirmation result
// @access  Public
router.get("/telegram-login-status/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const entry = await getPendingEntry(requestId);

  if (!entry) {
    return res.status(404).json({ message: "Login request not found or expired" });
  }

  if (entry.status === "pending") {
    return res.json({ status: "pending" });
  }

  if (entry.status === "confirmed") {
    // Clean up
    await deletePendingEntry(requestId);
    return res.json({
      status: "confirmed",
      token: entry.token,
      user: entry.user,
    });
  }

  if (entry.status === "declined") {
    await deletePendingEntry(requestId);
    return res.json({ status: "declined", message: "Login was declined." });
  }

  // expired or unknown
  await deletePendingEntry(requestId);
  res.json({ status: "expired" });
});

// @route   POST /api/auth/telegram-webhook
// @desc    Receive ALL Telegram updates: commands (/start, /help), messages, and callback queries
// @access  Public (Telegram servers call this)
router.post("/telegram-webhook", async (req, res) => {
  const botToken = process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

  // Acknowledge immediately so Telegram doesn't retry
  res.sendStatus(200);

  if (!botToken) return;

  // Helper to send a Telegram message
  const sendMessage = (chatId, text, extra = {}) =>
    axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...extra,
    }).catch((e) => console.error("sendMessage error:", e?.response?.data || e.message));

  try {
    const update = req.body;

    // ── 1. Handle callback queries (login confirm/decline buttons) ──────────
    const callbackQuery = update?.callback_query;
    if (callbackQuery) {
      const chatId = callbackQuery.from?.id;
      const messageId = callbackQuery.message?.message_id;
      const data = callbackQuery.data;

      // Menu inline button callbacks
      if (data === "menu_applications" || data === "menu_profile" || data === "menu_settings" || data === "menu_about") {
        await axios.post(
          `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
          { callback_query_id: callbackQuery.id }
        ).catch(() => {});
        const menuTexts = {
          menu_applications: [
            `📋 <b>Your Applications Arsenal</b>`,
            ``,
            `Your applications are your conquest log — every bid is a battle, every hire is a victory. Stay on top of your game and never let an opportunity slip.`,
            ``,
            `<b>What awaits you inside:</b>`,
            `• 🎯 <b>Active Bids</b> — Track your ongoing battles`,
            `• ✅ <b>Won Contracts</b> — Seal the deal and celebrate`,
            `• 📊 <b>Proposal Stats</b> — Know your win rate`,
            `• 🔔 <b>Real-time Alerts</b> — Strike when iron's hot`,
            ``,
            `🌐 <a href="https://hustlexet.vercel.app/dashboard/freelancer">Open Applications</a>`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `💼 <b>HustleX</b> — Your Freelance Journey`,
          ].join("\n"),
          menu_profile: [
            `👤 <b>Your Profile Arsenal</b>`,
            ``,
            `Your profile is your digital throne — the kingdom where clients discover your genius. It's not just a page; it's your 24/7 sales machine, your silent pitch, and the difference between "maybe" and "hired."`,
            ``,
            `A complete profile = 3× more invites, 5× more trust, and clients fighting to work with you.`,
            ``,
            `<b>What awaits you inside:</b>`,
            `• 🎯 <b>Battle Station</b> — Showcase skills that slay`,
            `• 🌟 <b>Epic Portfolio</b> — Let your work do the talkin'`,
            `• 📊 <b>Verified Badges</b> — Flex your credibility`,
            `• 🚀 <b>Instant Apply</b> — One tap to your next gig`,
            ``,
            `This isn't just a profile — it's your legacy in the making 👑`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `💼 <b>HustleX</b> — Your Freelance Journey`,
          ].join("\n"),
          menu_settings: [
            `⚙️ <b>Your Command Center</b>`,
            ``,
            `Your settings are your command center — tune your battlefield, control your notifications, and keep your arsenal sharp.`,
            ``,
            `<b>What you can configure:</b>`,
            `• 🔔 <b>Notifications</b> — Never miss a strike`,
            `• 👤 <b>Profile Visibility</b> — Control who sees your legend`,
            `• 🔒 <b>Privacy</b> — Lock down your fortress`,
            `• 🌐 <b>Preferences</b> — Customize your arena`,
            ``,
            `🌐 <a href="https://hustlexet.vercel.app/settings">Open Command Center</a>`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `💼 <b>HustleX</b> — Your Freelance Journey`,
          ].join("\n"),
          menu_about: [
            `🌟 <b>About HustleX</b> 🌟`,
            ``,
            `HustleX is the arena where Ethiopia's finest talent meets global opportunity. We're not just a platform — we're a movement building the future of work.`,
            ``,
            `<b>Why HustleX?</b>`,
            `• 🌍 <b>Global Reach</b> — Ethiopian talent, worldwide impact`,
            `• ✅ <b>Verified Trust</b> — Every profile, every client, vetted`,
            `• ⚡ <b>Instant Connect</b> — From pitch to hire in record time`,
            `• 💎 <b>Quality First</b> — Top-tier talent, premium results`,
            ``,
            `🌐 <a href="https://hustlexet.vercel.app">Join the Arena</a>`,
            `📧 support@hustleX.et`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━`,
            `💼 <b>HustleX</b> — Connecting Talent with Opportunity`,
          ].join("\n"),
        };
        await sendMessage(chatId, menuTexts[data]);
        return; // done with callback_query
      }

      if (data && data.startsWith("tglogin_")) {
        const action = data.startsWith("tglogin_confirm_")
          ? "confirm"
          : data.startsWith("tglogin_decline_")
            ? "decline"
            : null;

        if (action) {
          const requestId = data.replace(/^tglogin_(confirm|decline)_/, "");
          const entry = await getPendingEntry(requestId);

          // Answer the spinner
          await axios.post(
            `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
            {
              callback_query_id: callbackQuery.id,
              text: action === "confirm" ? "Login confirmed!" : "Login declined.",
            }
          ).catch(() => {});

          // Edit the original message
          const updatedText =
            action === "confirm"
              ? "✅ <b>Login Confirmed</b>\n\nYou have been logged in to HustleX successfully."
              : "❌ <b>Login Declined</b>\n\nThe login request has been rejected. If this wasn't you, please change your password.";

          await axios.post(
            `https://api.telegram.org/bot${botToken}/editMessageText`,
            { chat_id: chatId, message_id: messageId, text: updatedText, parse_mode: "HTML" }
          ).catch(() => {});

          if (entry) {
            entry.status = action === "confirm" ? "confirmed" : "declined";
            await setPendingEntry(requestId, entry);
          }
        }
      }
      return; // done with callback_query
    }

    // ── 2. Handle message updates (commands and text) ──────────────────────
    const message = update?.message;
    if (!message) return;

    const chatId = message.chat?.id;
    const text = message.text || "";
    const user = message.from;
    const firstName = user?.first_name || "there";
    const username = user?.username ? `@${user.username}` : firstName;

    // /start command
    if (text.startsWith("/start")) {
      const welcomeText = [
        `🌟 <b>Welcome to HustleX!</b> 🌟`,
        ``,
        `Hello <b>${firstName}</b>! 👋`,
        ``,
        `HustleX is the arena where Ethiopia's finest talent meets global opportunity. You're now in the fight — let's get you equipped.`,
        ``,
        `👇 Use the buttons below to navigate your battlefield:`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `💼 <b>HustleX</b> — Your Freelance Journey`,
      ].join("\n");

      await sendMessage(chatId, welcomeText, {
        reply_markup: {
          keyboard: [
            [{ text: "👤 My Profile" }, { text: "📋 Applications" }],
            [{ text: "⚙️ Settings" }, { text: "ℹ️ About HustleX" }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    // /help command
    if (text.startsWith("/help") || text === "📋 Applications" || text === "📋 Application") {
      const helpText = [
        `📋 <b>Your Applications Arsenal</b>`,
        ``,
        `Your applications are your conquest log — every bid is a battle, every hire is a victory. Stay on top of your game and never let an opportunity slip.`,
        ``,
        `<b>What awaits you inside:</b>`,
        `• 🎯 <b>Active Bids</b> — Track your ongoing battles`,
        `• ✅ <b>Won Contracts</b> — Seal the deal and celebrate`,
        `• 📊 <b>Proposal Stats</b> — Know your win rate`,
        `• 🔔 <b>Real-time Alerts</b> — Strike when iron's hot`,
        ``,
        `🌐 <a href="https://hustlexet.vercel.app/dashboard/freelancer">Open Applications</a>`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `💼 <b>HustleX</b> — Your Freelance Journey`,
      ].join("\n");

      await sendMessage(chatId, helpText, {
        reply_markup: {
          keyboard: [
            [{ text: "📋 Application" }, { text: "👤 Profile" }],
            [{ text: "⚙️ Setting" }, { text: "ℹ️ About" }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    // /profile command or button
    if (text.startsWith("/profile") || text === "👤 My Profile" || text === "👤 Profile") {
      const profileText = [
        `👤 <b>Your Profile Arsenal</b>`,
        ``,
        `Your profile is your digital throne — the kingdom where clients discover your genius. It's not just a page; it's your 24/7 sales machine, your silent pitch, and the difference between "maybe" and "hired."`,
        ``,
        `A complete profile = 3× more invites, 5× more trust, and clients fighting to work with you.`,
        ``,
        `<b>What awaits you inside:</b>`,
        `• 🎯 <b>Battle Station</b> — Showcase skills that slay`,
        `• 🌟 <b>Epic Portfolio</b> — Let your work do the talkin'`,
        `• 📊 <b>Verified Badges</b> — Flex your credibility`,
        `• 🚀 <b>Instant Apply</b> — One tap to your next gig`,
        ``,
        `This isn't just a profile — it's your legacy in the making 👑`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `💼 <b>HustleX</b> — Your Freelance Journey`,
      ].join("\n");

      await sendMessage(chatId, profileText, {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [
            [{ text: "📋 Application" }, { text: "👤 Profile" }],
            [{ text: "⚙️ Setting" }, { text: "ℹ️ About" }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    // About button
    if (text === "ℹ️ About HustleX" || text === "ℹ️ About") {
      const aboutText = [
        `🌟 <b>About HustleX</b> 🌟`,
        ``,
        `HustleX is the arena where Ethiopia's finest talent meets global opportunity. We're not just a platform — we're a movement building the future of work.`,
        ``,
        `<b>Why HustleX?</b>`,
        `• 🌍 <b>Global Reach</b> — Ethiopian talent, worldwide impact`,
        `• ✅ <b>Verified Trust</b> — Every profile, every client, vetted`,
        `• ⚡ <b>Instant Connect</b> — From pitch to hire in record time`,
        `• 💎 <b>Quality First</b> — Top-tier talent, premium results`,
        ``,
        `🌐 <a href="https://hustlexet.vercel.app">Join the Arena</a>`,
        `📧 support@hustleX.et`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `💼 <b>HustleX</b> — Connecting Talent with Opportunity`,
      ].join("\n");

      await sendMessage(chatId, aboutText, {
        reply_markup: {
          keyboard: [
            [{ text: "📋 Application" }, { text: "👤 Profile" }],
            [{ text: "⚙️ Setting" }, { text: "ℹ️ About" }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    // Setting button
    if (text === "⚙️ Settings" || text === "⚙️ Setting") {
      const settingText = [
        `⚙️ <b>Your Command Center</b>`,
        ``,
        `Your settings are your command center — tune your battlefield, control your notifications, and keep your arsenal sharp.`,
        ``,
        `<b>What you can configure:</b>`,
        `• 🔔 <b>Notifications</b> — Never miss a strike`,
        `• 👤 <b>Profile Visibility</b> — Control who sees your legend`,
        `• 🔒 <b>Privacy</b> — Lock down your fortress`,
        `• 🌐 <b>Preferences</b> — Customize your arena`,
        ``,
        `🌐 <a href="https://hustlexet.vercel.app/settings">Open Command Center</a>`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `💼 <b>HustleX</b> — Your Freelance Journey`,
      ].join("\n");

      await sendMessage(chatId, settingText, {
        reply_markup: {
          keyboard: [
            [{ text: "📋 Application" }, { text: "👤 Profile" }],
            [{ text: "⚙️ Setting" }, { text: "ℹ️ About" }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    // Default fallback for unrecognized messages
    await sendMessage(
      chatId,
      `💬 Hi ${firstName}! Use /start to see available options or /help for more info.`,
      {
        reply_markup: {
          keyboard: [
            [{ text: "📋 Application" }, { text: "👤 Profile" }],
            [{ text: "⚙️ Setting" }, { text: "ℹ️ About" }],
          ],
          resize_keyboard: true,
        },
      }
    );

  } catch (err) {
    console.error(
      "Telegram webhook error:",
      err?.response?.data || err.message
    );
  }
});

// @route   GET /api/auth/telegram-config
// @desc    Get Telegram bot username
// @access  Public
router.get("/telegram-config", (req, res) => {
  const configured = !!(process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN);
  res.json({
    botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
    configured,
  });
});

// @route   POST /api/auth/save-phone
// @desc    Save user's phone number
// @access  Private
router.post(
  "/save-phone",
  [
    auth,
    body("phone").isString().trim().notEmpty().withMessage("Phone number is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const normalized = normalizePhone(phone);
      const user = req.user;

      if (!normalized) {
        return res.status(400).json({ message: "Invalid phone number" });
      }

      // Update user's phone number (store normalized)
      user.profile.phone = normalized;
      await user.save();

      res.json({
        message: "Phone number saved successfully",
        user: toAuthUserPayload(user)
      });
    } catch (error) {
      console.error("Save phone error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/auth/check-user-by-phone
// @desc    Check if user exists by phone number
// @access  Public
router.get("/check-user-by-phone", async (req, res) => {
  try {
    const rawPhone = req.query.phone;
    const phone = normalizePhone(rawPhone);

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Try exact normalized match first, then suffix match so that
    // e.g. 251912345678 matches 912345678 (with or without country code).
    let user = await User.findOne({ "profile.phone": phone });
    if (!user) {
      // The stored phone may have a country-code prefix the query lacks, or vice versa.
      // Use $where to check that one string ends with the other (safe since phone is
      // digits-only after normalizePhone, so no injection risk).
      user = await User.findOne({
        $where: `this.profile.phone && (this.profile.phone.endsWith("${phone}") || "${phone}".endsWith(this.profile.phone))`
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        role: user.currentRole,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Check user by phone error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/telegram-profile
// @desc    Get user profile by Telegram ID (for bot read-back)
// @access  Public (used by Telegram bot with shared token secret)
router.get("/telegram-profile", async (req, res) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ message: "telegramId query param is required" });
    }

    const tid = parseInt(telegramId, 10);
    if (isNaN(tid)) {
      return res.status(400).json({ message: "Invalid Telegram ID" });
    }

    const user = await User.findOne({ "telegram.id": tid })
      .select("email profile roles currentRole createdAt telegram slug")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        slug: user.slug,
        telegram: user.telegram,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Get telegram profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/test-telegram
// @desc    Test Telegram bot connectivity — sends a test message to TELEGRAM_CHAT_ID
// @access  Public
router.get("/test-telegram", async (req, res) => {
  const botToken = process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const result = {
    botTokenSet: !!botToken,
    chatIdSet: !!chatId,
    chatIdValue: chatId || null,
    botTokenPrefix: botToken ? botToken.split(":")[0] + ":..." : null,
    messageSent: false,
    error: null,
  };

  if (!botToken || !chatId) {
    return res.json({ ...result, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set" });
  }

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: "🧪 <b>Test message from HustleX backend</b>\n\nIf you see this, the bot can DM you!",
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    result.messageSent = true;
  } catch (err) {
    result.error = err?.response?.data || err.message;
  }

  res.json(result);
});

// @route   GET /api/auth/drop-phone-index
// @desc    Drop unique index on profile.phone
// @access  Public (for maintenance)
router.get("/drop-phone-index", async (req, res) => {
  try {
    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    let dropped = [];

    for (const index of indexes) {
      if (index.key && index.key['profile.phone']) {
        await collection.dropIndex(index.name);
        dropped.push(index.name);
      }
    }

    res.json({
      message: "Index drop complete",
      droppedIndexes: dropped
    });
  } catch (err) {
    console.error("Drop index error:", err);
    res.status(500).json({ message: "Error dropping index", error: err.message });
  }
});

module.exports = router;
