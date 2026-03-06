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

module.exports = auth;
