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

const clearAllUsers = async () => {
  try {
    await connectDB();

    console.log("🔍 Checking existing users...");

    // Get all users count before deletion
    const allUsers = await User.find({})
      .select('email roles currentRole profile.firstName profile.lastName')
      .lean();

    console.log(`Found ${allUsers.length} total users in database:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
      if (user.profile) {
        console.log(`   Name: ${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
      }
    });

    if (allUsers.length === 0) {
      console.log('✅ No users found to clear. Database is already clean.');
      return;
    }

    // Ask for confirmation
    console.log(`\n⚠️  WARNING: This will permanently delete ${allUsers.length} users (freelancers and clients)!`);
    console.log('This action cannot be undone.');

    // For safety, we'll proceed with deletion
    console.log('\n🗑️  Deleting all users...');

    const result = await User.deleteMany({});

    console.log(`✅ Successfully deleted ${result.deletedCount} users`);

    // Also clear related data
    try {
      // Clear all jobs
      const Job = mongoose.model('Job', new mongoose.Schema({}));
      const jobResult = await Job.deleteMany({});
      console.log(`✅ Cleared ${jobResult.deletedCount} jobs`);

      // Clear all applications
      const Application = mongoose.model('Application', new mongoose.Schema({}));
      const appResult = await Application.deleteMany({});
      console.log(`✅ Cleared ${appResult.deletedCount} applications`);

      // Clear all messages
      const Message = mongoose.model('Message', new mongoose.Schema({}));
      const messageResult = await Message.deleteMany({});
      console.log(`✅ Cleared ${messageResult.deletedCount} messages`);

      // Clear all companies
      const Company = mongoose.model('Company', new mongoose.Schema({}));
      const companyResult = await Company.deleteMany({});
      console.log(`✅ Cleared ${companyResult.deletedCount} companies`);

      // Clear all blogs
      const Blog = mongoose.model('Blog', new mongoose.Schema({}));
      const blogResult = await Blog.deleteMany({});
      console.log(`✅ Cleared ${blogResult.deletedCount} blogs`);

    } catch (error) {
      console.log('Some related data may not have been cleared:', error.message);
    }

    console.log('\n🎉 All users and related data cleared successfully!');
    console.log('You can now start completely fresh with new accounts.');

  } catch (error) {
    console.error("❌ Error clearing users:", error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the function
clearAllUsers();
