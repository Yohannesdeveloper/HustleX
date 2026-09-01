const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("../config/database");

async function fixEmailIndex() {
  console.log("🚀 Starting email index fix...");

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // 1. Check existing indexes
    const indexes = await collection.indexes();
    console.log("Current indexes on 'users' collection:");
    console.log(indexes);

    const hasEmailIndex = indexes.some(idx => idx.name === "email_1");

    if (hasEmailIndex) {
      console.log("🗑️ Dropping existing email_1 index...");
      await collection.dropIndex("email_1");
      console.log("✅ Dropped email_1 index successfully.");
    } else {
      console.log("ℹ️ No email_1 index found to drop.");
    }

    // 2. Create the index as unique AND sparse
    console.log("📊 Creating unique, sparse email_1 index...");
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("✅ Recreated unique, sparse email_1 index successfully!");

    // Verify index list again
    const finalIndexes = await collection.indexes();
    console.log("New indexes on 'users' collection:");
    console.log(finalIndexes);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing email index:", error.message || error);
    process.exit(1);
  }
}

fixEmailIndex();
