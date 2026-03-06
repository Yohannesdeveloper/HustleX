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
  fs.appendFileSync(path.join(__dirname, 'check_users_output.txt'), message + '\n');
};

const checkUsers = async () => {
  try {
    fs.writeFileSync(path.join(__dirname, 'check_users_output.txt'), ''); // Clear file
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    logToFile(`MongoDB Connected: ${conn.connection.host}`);
    logToFile("Checking existing users...");

    // Get all users
    const allUsers = await User.find({}).select('email roles currentRole profile.firstName profile.lastName').lean();
    logToFile(`Total users in database: ${allUsers.length}`);

    // Get freelancers specifically
    const freelancers = await User.find({ roles: { $in: ["freelancer"] } })
      .select('email roles currentRole profile.firstName profile.lastName profile.title')
      .lean();

    logToFile(`\nFreelancers found: ${freelancers.length}`);
    freelancers.forEach((user, index) => {
      logToFile(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
      if (user.profile) {
        logToFile(`   Name: ${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim());
        logToFile(`   Title: ${user.profile.title || 'No title'}`);
      }
    });

    // Get clients
    const clients = await User.find({ roles: { $in: ["client"] } })
      .select('email roles currentRole')
      .lean();

    logToFile(`\nClients found: ${clients.length}`);
    clients.forEach((user, index) => {
      logToFile(`${index + 1}. ${user.email} - ${user.roles} - ${user.currentRole}`);
    });

    logToFile("Check complete.");
    process.exit(0);
  } catch (error) {
    logToFile(`Error checking users: ${error}`);
    console.error("Error checking users:", error);
    process.exit(1);
  }
};

checkUsers();
