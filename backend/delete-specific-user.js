const mongoose = require("mongoose");
const dns = require("dns");
const User = require("./models/User");
require("dotenv").config();

// Set DNS servers like in config/database.js to fix querySrv ECONNREFUSED
const dnsServers = process.env.DNS_SERVERS
  ? process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["8.8.8.8", "8.8.4.4", "1.1.1.1"];
dns.setServers(dnsServers);

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      family: 4,
    };
    
    let mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex";
    
    // Add database name if missing
    const url = new URL(mongoUri);
    if (!url.pathname || url.pathname === "/" || url.pathname === "") {
      url.pathname = "/hustlex";
      mongoUri = url.toString();
    }
    
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const deleteSpecificUser = async () => {
  try {
    await connectDB();
    
    // Check both possible emails
    const possibleEmails = ["yohannesfk6677@gmail.com"];
    
    console.log(`Looking for users with emails: ${possibleEmails.join(", ")}`);
    
    const users = await User.find({ email: { $in: possibleEmails } });
    
    if (users.length === 0) {
      console.log(`No users found with those emails.`);
      process.exit(0);
    }
    
    console.log(`Found ${users.length} user(s):`);
    users.forEach(user => {
      console.log(`  - ${user.profile?.firstName || ''} ${user.profile?.lastName || ''} (${user.email})`);
    });
    
    // Delete all found users
    console.log(`\nDeleting all found users...`);
    for (const user of users) {
      await User.deleteOne({ _id: user._id });
      console.log(`  ✅ Deleted: ${user.email}`);
    }
    
    console.log(`\n✅ All matching users deleted successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("Error deleting user(s):", error);
    process.exit(1);
  }
};

deleteSpecificUser();
