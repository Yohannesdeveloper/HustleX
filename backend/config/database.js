const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if not supported in environment
}
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex";
  
  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error("\n🔍 DNS Resolution Error - Possible causes:");
      console.error("   1. No internet connection");
      console.error("   2. MongoDB Atlas cluster is paused or deleted");
      console.error("   3. DNS server issues");
      console.error("   4. Firewall blocking MongoDB Atlas");
      console.error("\n💡 Solutions:");
      console.error("   - Check your internet connection");
      console.error("   - Verify MongoDB Atlas cluster is running");
      console.error("   - Check MongoDB Atlas Network Access settings");
      console.error("   - Try using a different DNS server (e.g., 8.8.8.8)");
    } else if (error.message.includes('authentication failed')) {
      console.error("\n🔍 Authentication Error:");
      console.error("   - Check your MongoDB username and password");
      console.error("   - Verify database user has correct permissions");
    } else if (error.message.includes('timeout')) {
      console.error("\n🔍 Connection Timeout:");
      console.error("   - Check your internet connection");
      console.error("   - Verify MongoDB Atlas IP whitelist includes your IP");
      console.error("   - Try increasing serverSelectionTimeoutMS");
    }
    
    console.log("\n⚠️  Server will continue running without database connection");
    console.log("   API endpoints requiring database will fail");
    console.log("   Messages will be stored in memory temporarily");
    // Don't exit, allow server to run
  }
};

module.exports = connectDB;
