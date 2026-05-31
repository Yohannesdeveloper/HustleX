const dns = require("dns");
const mongoose = require("mongoose");

// Some ISP/router DNS resolvers refuse SRV lookups from Node (querySrv ECONNREFUSED).
// Public DNS avoids mongodb+srv:// connection failures on Windows.
const dnsServers = process.env.DNS_SERVERS
  ? process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["8.8.8.8", "8.8.4.4", "1.1.1.1"];
dns.setServers(dnsServers);

const connectDB = async () => {
  try {
    // Enhanced connection options for high concurrency (1M+ users: Atlas M30+, sharded cluster)
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 100,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 10,
      // Limit simultaneous new connections to prevent thundering-herd on pod startup
      maxConnecting: 10,
      retryWrites: true,
      retryReads: true,
      w: "majority",
      readPreference: process.env.MONGO_READ_PREF || "primaryPreferred",
      family: 4,
      readPreferenceTags: process.env.MONGO_READ_TAGS || undefined,
      // SECURITY: Never allow invalid TLS certificates in production.
      // In development, set MONGODB_TLS_INSECURE=true only if needed (e.g. AV/SSL inspection).
      tlsAllowInvalidCertificates: isProduction
        ? false
        : process.env.MONGODB_TLS_INSECURE === "true",
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📖 Read Preference: ${options.readPreference}`);
    if (process.env.MONGO_READ_PREF) {
      console.log(`   (set via MONGO_READ_PREF — use secondaryPreferred on Atlas replica sets)`);
    }

    if (!global.__hustlexDbEventsHook) {
      global.__hustlexDbEventsHook = true;

      mongoose.connection.on("error", (err) => {
        console.error("❌ Mongoose connection error:", err.message);
      });

      mongoose.connection.on("disconnected", () => {
        if (process.env.NODE_ENV === "production") {
          console.warn("⚠️  Mongoose disconnected from MongoDB");
        }
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 Mongoose reconnected to MongoDB");
      });
    }

    if (process.env.NODE_ENV === "production" && !global.__hustlexDbShutdownHook) {
      global.__hustlexDbShutdownHook = true;
      const shutdown = async () => {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      };
      process.once("SIGINT", shutdown);
      process.once("SIGTERM", shutdown);
    }

  } catch (error) {
    const msg = error.message || String(error);
    console.error("❌ Database connection error:", msg);
    if (msg.includes("whitelist")) {
      console.log("💡 If your IP is already in Atlas Network Access, the cause may be TLS/credentials — check the full error above.");
    }
    console.log("⚠️  Server will continue running without database connection");
    console.log("📝 Data operations will fail until connection is restored");

    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      console.log("🔄 Attempting to reconnect to MongoDB...");
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB;
