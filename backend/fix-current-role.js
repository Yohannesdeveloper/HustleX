/**
 * fix-current-role.js
 * Resets currentRole for yohannesfk123@gmail.com to 'freelancer'
 * so it shows freelancer/client options on login instead of admin UI.
 */
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const EMAIL = "yohannesfk123@gmail.com";
const NEW_CURRENT_ROLE = "freelancer"; // change to 'client' if preferred

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
  console.log("Current currentRole:", user.currentRole);

  await User.updateOne(
    { email: EMAIL },
    { $set: { currentRole: NEW_CURRENT_ROLE } }
  );

  const updated = await User.findOne({ email: EMAIL });
  console.log("\n✅ Updated successfully!");
  console.log("roles:", updated.roles);
  console.log("currentRole:", updated.currentRole);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
