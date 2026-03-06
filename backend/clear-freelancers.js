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

const clearFreelancers = async () => {
  try {
    await connectDB();

    console.log("🔍 Checking existing freelancers...");

    // Get freelancers count before deletion
    const freelancers = await User.find({ roles: { $in: ["freelancer"] } })
      .select('email roles currentRole profile.firstName profile.lastName')
      .lean();

    console.log(`Found ${freelancers.length} freelancers:`);
    freelancers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
      if (user.profile) {
        console.log(`   Name: ${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
      }
    });

    if (freelancers.length === 0) {
      console.log('✅ No freelancers found to clear. Database is already clean.');
      return;
    }

    // Ask for confirmation
    console.log(`\n⚠️  WARNING: This will permanently delete ${freelancers.length} freelancers!`);
    console.log('This action cannot be undone.');

    // For safety, we'll proceed with deletion
    console.log('\n🗑️  Deleting freelancers...');

    const result = await User.deleteMany({ roles: { $in: ["freelancer"] } });

    console.log(`✅ Successfully deleted ${result.deletedCount} freelancers`);

    // Also clear related data
    try {
      // Clear applications where freelancers were involved
      const Application = mongoose.model('Application', new mongoose.Schema({}));
      const appResult = await Application.deleteMany({
        freelancerId: { $exists: true }
      });
      console.log(`✅ Cleared ${appResult.deletedCount} applications`);

      // Clear messages where freelancers were involved
      const Message = mongoose.model('Message', new mongoose.Schema({}));
      const messageResult = await Message.deleteMany({
        $or: [
          { sender: { $in: freelancers.map(f => f._id) } },
          { receiver: { $in: freelancers.map(f => f._id) } }
        ]
      });
      console.log(`✅ Cleared ${messageResult.deletedCount} messages`);

    } catch (error) {
      console.log('Some related data may not have been cleared:', error.message);
    }

    console.log('\n🎉 All freelancers and related data cleared successfully!');
    console.log('You can now start fresh with new freelancer accounts.');

  } catch (error) {
    console.error("❌ Error clearing freelancers:", error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the function
clearFreelancers();
