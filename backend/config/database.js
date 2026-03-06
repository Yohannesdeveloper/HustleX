const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Enhanced connection options for better stability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 75000, // Increased to 75 seconds
      connectTimeoutMS: 30000, // 30 seconds for initial connection
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      maxPoolSize: 50, // Increased pool size
      minPoolSize: 10, // Maintain minimum connections
      retryWrites: true,
      retryReads: true, // Enable retry for read operations
      w: 'majority',
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful reconnection on disconnect
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Database connection error:", error.message);
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
