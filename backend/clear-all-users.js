const mongoose = require("mongoose");
const dns = require("dns");
const User = require("./models/User");
const Application = require("./models/Application");
const Message = require("./models/Message");
const Job = require("./models/Job");
const Company = require("./models/Company");
require("dotenv").config();

// Broken local DNS fix: use Google DNS for resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex";

const clearAll = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Count before deletion
    const freelancerCount = await User.countDocuments({ roles: { $in: ["freelancer"] } });
    const clientCount = await User.countDocuments({ roles: { $in: ["client"] } });
    const adminCount = await User.countDocuments({ roles: { $in: ["admin"] } });

    console.log(`\nCurrent users:`);
    console.log(`  Freelancers: ${freelancerCount}`);
    console.log(`  Clients:     ${clientCount}`);
    console.log(`  Admins:      ${adminCount} (will be KEPT)`);

    if (freelancerCount === 0 && clientCount === 0) {
      console.log("\n✅ No freelancers or clients to delete. Database is clean.");
      return;
    }

    console.log(`\n⚠️  Deleting ${freelancerCount + clientCount} users (freelancers + clients)...`);

    // Delete freelancers and clients
    const userResult = await User.deleteMany({
      roles: { $in: ["freelancer", "client"] }
    });
    console.log(`✅ Deleted ${userResult.deletedCount} users`);

    // Delete all applications
    const appResult = await Application.deleteMany({});
    console.log(`✅ Deleted ${appResult.deletedCount} applications`);

    // Delete all messages
    const msgResult = await Message.deleteMany({});
    console.log(`✅ Deleted ${msgResult.deletedCount} messages`);

    // Delete all jobs
    const jobResult = await Job.deleteMany({});
    console.log(`✅ Deleted ${jobResult.deletedCount} jobs`);

    // Delete all companies
    const companyResult = await Company.deleteMany({});
    console.log(`✅ Deleted ${companyResult.deletedCount} companies`);

    // Verify admins remain
    const remainingAdmins = await User.countDocuments({ roles: { $in: ["admin"] } });
    console.log(`\n🎉 All freelancers, clients, and related data cleared!`);
    console.log(`   ${remainingAdmins} admin account(s) preserved.`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

clearAll();
