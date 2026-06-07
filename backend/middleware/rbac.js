/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides granular permission control for different user roles
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Check if user has required role(s)
 * @param {string|string[]} roles - Single role or array of roles allowed
 * @param {boolean} requireAll - If true, user must have ALL roles; if false, ANY role is sufficient
 */
const requireRole = (roles, requireAll = false) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ 
          message: "No token, authorization denied",
          required: requireAll ? "all" : "any",
          roles: Array.isArray(roles) ? roles : [roles]
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      // Check role permission
      const hasPermission = requireAll
        ? requiredRoles.every(role => user.roles.includes(role))
        : requiredRoles.some(role => user.roles.includes(role));

      if (!hasPermission) {
        return res.status(403).json({
          message: "Insufficient permissions",
          required: requireAll ? "all" : "any",
          roles: requiredRoles,
          userRoles: user.roles
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("RBAC Error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
};

/**
 * Middleware to allow freelancer access
 */
const requireFreelancer = requireRole("freelancer");

/**
 * Middleware to allow client access
 */
const requireClient = requireRole("client");

/**
 * Middleware to allow admin access
 */
const requireAdmin = requireRole("admin");

/**
 * Middleware to allow freelancer OR client access
 */
const requireFreelancerOrClient = requireRole(["freelancer", "client"]);

/**
 * Middleware to check if user owns the resource
 * @param {string} userIdField - Field name in request that contains user ID
 */
const requireOwnership = (userIdField = "userId") => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      // Check ownership
      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      
      if (resourceUserId && user._id.toString() !== resourceUserId.toString()) {
        // Allow admin to bypass ownership check
        if (!user.roles.includes('admin')) {
          return res.status(403).json({ 
            message: "You can only access your own resources",
            required: resourceUserId,
            got: user._id.toString()
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("Ownership Check Error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
};

/**
 * Middleware to check if profile is complete
 */
const requireCompleteProfile = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Check if profile is complete
    if (!user.profile || !user.profile.isProfileComplete) {
      return res.status(403).json({
        message: "Please complete your profile first",
        redirect: user.currentRole === "client" ? "/company-profile" : "/freelancer-profile-setup"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Profile Check Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Middleware to check subscription status
 * @param {string[]} allowedPlans - Array of allowed subscription plans
 */
const requireSubscription = (allowedPlans = ["basic", "premium"]) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      // Check subscription
      const subscription = user.subscription;
      
      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({
          message: "Active subscription required",
          currentPlan: subscription?.planId || "none",
          required: allowedPlans
        });
      }

      // Check if subscription is expired
      if (subscription.expiresAt && new Date() > new Date(subscription.expiresAt)) {
        return res.status(403).json({
          message: "Subscription has expired",
          expiredAt: subscription.expiresAt
        });
      }

      // Check if plan is allowed
      if (!allowedPlans.includes(subscription.planId) && subscription.planId !== "admin") {
        return res.status(403).json({
          message: "Insufficient subscription tier",
          currentPlan: subscription.planId,
          required: allowedPlans
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("Subscription Check Error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = {
  requireRole,
  requireFreelancer,
  requireClient,
  requireAdmin,
  requireFreelancerOrClient,
  requireOwnership,
  requireCompleteProfile,
  requireSubscription
};
