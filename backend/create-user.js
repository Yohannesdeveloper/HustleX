const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const createUser = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: "yohannesfk123@gmail.com" });
    if (existingUser) {
      console.log("User already exists:", existingUser.email);
      process.exit(0);
    }

    // Create new user
    const user = new User({
      email: "yohannesfk123@gmail.com",
      password: "0991313700Yf@",
      roles: ["admin", "freelancer", "client"],
      currentRole: "admin",
      profile: {
        firstName: "Yohannes",
        lastName: "Developer",
        phone: "+251900000000",
        location: "Addis Ababa, Ethiopia",
        bio: "Administrator and Developer",
        isProfileComplete: true
      },
    });

    await user.save();
    console.log("Created user:", user.email);
    console.log("Password set to: 0991313700Yf@");

    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
};

createUser();
