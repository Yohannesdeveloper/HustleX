/**
 * create-admin.js
 * Creates or upgrades the HustleX admin account.
 * Run with: node create-admin.js [password]
 * Example: node create-admin.js MyAdminPass123
 */
// Fix DNS resolution for MongoDB Atlas SRV records
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const { getAdminEmail } = require("./config/admin");
const ADMIN_EMAIL = getAdminEmail();
const ADMIN_PASSWORD = process.argv[2] || "0991313700Yf@";

const run = async () => {
  let uri = process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex";
  // Ensure database name is in URI (Atlas URIs may omit it)
  try {
    const url = new URL(uri);
    if (!url.pathname || url.pathname === "/" || url.pathname === "") {
      url.pathname = "/hustlex";
      uri = url.toString();
    }
  } catch (e) {}
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log("✅ Connected!");

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    console.log(`Found existing account: ${user.email}`);
    console.log("Current roles:", user.roles);
    console.log("Current role:", user.currentRole);

    // Upgrade to admin
    if (!user.roles.includes("admin")) {
      user.roles = ["admin", ...(user.roles || [])];
    }
    user.currentRole = "admin";

    // Always update password to the configured default
    user.password = ADMIN_PASSWORD;
    console.log(`Updating password to: ${ADMIN_PASSWORD}`);

    await user.save();
    console.log("\n✅ Admin account upgraded successfully!");
  } else {
    console.log(`No account found for ${ADMIN_EMAIL}. Creating...`);

    user = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      roles: ["admin"],
      currentRole: "admin",
      profile: {
        firstName: "Admin",
        lastName: "HustleX",
        isProfileComplete: true,
      },
    });

    await user.save();
    console.log(`\n✅ Admin account created successfully!`);
  }

  console.log("─".repeat(40));
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Roles:    ${user.roles.join(", ")}`);
  console.log(`Role:     ${user.currentRole}`);
  console.log("─".repeat(40));
  console.log("\nYou can now log in at /login or /signup with these credentials.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
