/**
 * make-admin.js
 * Upgrades an existing user to admin role using the backend's env config.
 * Run with: node make-admin.js
 */
const mongoose = require("mongoose");
const User = require("./models/User");

// Load env from backend .env
require("dotenv").config({ path: __dirname + "/.env" });

const { getAdminEmail } = require("./config/admin");
const EMAIL = getAdminEmail();

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log("✅ Connected!");

  const user = await User.findOne({ email: EMAIL });
  if (!user) {
    console.error(`❌ User not found: ${EMAIL}`);
    process.exit(1);
  }

  console.log("Found user:", user.email);
  console.log("Current roles:", user.roles);
  console.log("Current role:", user.currentRole);

  // Force update roles and currentRole
  await User.updateOne(
    { email: EMAIL },
    {
      $set: {
        roles: ["admin", "client"],
        currentRole: "admin",
      },
    }
  );

  const updated = await User.findOne({ email: EMAIL });
  console.log("\n✅ User updated successfully!");
  console.log("New roles:", updated.roles);
  console.log("New currentRole:", updated.currentRole);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
