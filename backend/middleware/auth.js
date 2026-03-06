const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth middleware - Token received:", token ? "Yes" : "No");

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "Auth middleware - Token decoded successfully for user:",
      decoded.userId
    );

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("Auth middleware - User not found for ID:", decoded.userId);
      return res.status(401).json({ message: "Token is not valid" });
    }

    console.log(
      "Auth middleware - User authenticated successfully:",
      user.email
    );
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware - Error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin-only middleware
const adminAuth = async (req, res, next) => {
  try {
    // Bypass with admin code header
    const headerCode = req.header("x-admin-code");
    // Hardcode fallback codes to ensure bypass works even if ENV is missing
    const fallbackCodes = ["BlogPost", "JobModeration"];

    // Check if header matches ANY valid code (ENV or fallback)
    const isEnvMatch = process.env.ADMIN_CODE && headerCode === process.env.ADMIN_CODE;
    const isFallbackMatch = headerCode && fallbackCodes.includes(headerCode);

    if (isEnvMatch || isFallbackMatch) {
      console.log("Admin auth middleware - Bypassed with code:", headerCode);
      return next();
    }
    // First check if user is authenticated
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Allow if ADMIN_ID matches or user has admin role
    const isEnvAdmin = process.env.ADMIN_ID && user._id.toString() === process.env.ADMIN_ID;
    const isRoleAdmin = Array.isArray(user.roles) && user.roles.includes('admin');
    if (!isEnvAdmin && !isRoleAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Admin auth middleware - Error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { auth, adminAuth };
