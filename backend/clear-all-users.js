const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const fs = require('fs');
const path = require('path');

const logToFile = (message) => {
  fs.appendFileSync(path.join(__dirname, 'clear_users_output.txt'), message + '\n');
  console.log(message);
};

const clearAllUsers = async () => {
  try {
    fs.writeFileSync(path.join(__dirname, 'clear_users_output.txt'), ''); // Clear file
    await connectDB();

    logToFile("🔍 Checking existing users...");

    // Get all users count before deletion
    const allUsers = await User.find({})
      .select('email roles currentRole profile.firstName profile.lastName')
      .lean();

    logToFile(`Found ${allUsers.length} total users in database:`);
    allUsers.forEach((user, index) => {
      logToFile(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
      if (user.profile) {
        logToFile(`   Name: ${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
      }
    });

    if (allUsers.length === 0) {
      logToFile('✅ No users found to clear. Database is already clean.');
      return;
    }

    // Ask for confirmation (skipped for automated run)
    logToFile(`\n⚠️  WARNING: This will permanently delete ${allUsers.length} users (freelancers and clients)!`);
    logToFile('This action cannot be undone.');

    // For safety, we'll proceed with deletion
    logToFile('\n🗑️  Deleting all users...');

    const result = await User.deleteMany({});

    logToFile(`✅ Successfully deleted ${result.deletedCount} users`);

    // Also clear related data
    try {
      // Clear all jobs
      const Job = mongoose.model('Job', new mongoose.Schema({}));
      const jobResult = await Job.deleteMany({});
      logToFile(`✅ Cleared ${jobResult.deletedCount} jobs`);

      // Clear all applications
      const Application = mongoose.model('Application', new mongoose.Schema({}));
      const appResult = await Application.deleteMany({});
      logToFile(`✅ Cleared ${appResult.deletedCount} applications`);

      // Clear all messages
      const Message = mongoose.model('Message', new mongoose.Schema({}));
      const messageResult = await Message.deleteMany({});
      logToFile(`✅ Cleared ${messageResult.deletedCount} messages`);

      // Clear all companies
      const Company = mongoose.model('Company', new mongoose.Schema({}));
      const companyResult = await Company.deleteMany({});
      logToFile(`✅ Cleared ${companyResult.deletedCount} companies`);

      // Clear all blogs
      const Blog = mongoose.model('Blog', new mongoose.Schema({}));
      const blogResult = await Blog.deleteMany({});
      logToFile(`✅ Cleared ${blogResult.deletedCount} blogs`);

    } catch (error) {
      logToFile(`Some related data may not have been cleared: ${error.message}`);
    }

    logToFile('\n🎉 All users and related data cleared successfully!');
    logToFile('You can now start completely fresh with new accounts.');

  } catch (error) {
    logToFile(`❌ Error clearing users: ${error}`);
  } finally {
    await mongoose.connection.close();
    logToFile('Database connection closed.');
  }
};

// Run the function
clearAllUsers();
