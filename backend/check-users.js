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

const checkUsers = async () => {
  try {
    await connectDB();

    console.log("Checking existing users...");

    // Get all users
    const allUsers = await User.find({}).select('email roles currentRole profile.firstName profile.lastName').lean();
    console.log(`Total users in database: ${allUsers.length}`);

    // Get freelancers specifically
    const freelancers = await User.find({ roles: { $in: ["freelancer"] } })
      .select('email roles currentRole profile.firstName profile.lastName profile.title')
      .lean();

    console.log(`\nFreelancers found: ${freelancers.length}`);
    freelancers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
      if (user.profile) {
        console.log(`   Name: ${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
        console.log(`   Title: ${user.profile.title || 'No title'}`);
      }
    });

    // Get clients
    const clients = await User.find({ roles: { $in: ["client"] } })
      .select('email roles currentRole')
      .lean();

    console.log(`\nClients found: ${clients.length}`);
    clients.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
};

checkUsers();
