const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const testPassword = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Find the user
    const user = await User.findOne({ email: "yohannesfk123@gmail.com" });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    console.log("User found:", user.email);
    console.log("User roles:", user.roles);
    console.log("User currentRole:", user.currentRole);
    console.log("Password hash exists:", !!user.password);

    // Test password comparison
    const testPassword = "0991313700Yf@";
    const isMatch = await user.comparePassword(testPassword);
    console.log(`Password "${testPassword}" matches:`, isMatch);

    // Try a few other common passwords
    const commonPasswords = ["admin123", "password", "123456", "freelancer123"];
    for (const pwd of commonPasswords) {
      const match = await user.comparePassword(pwd);
      console.log(`Password "${pwd}" matches:`, match);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testPassword();
