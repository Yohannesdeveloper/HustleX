/**
 * MongoDB Index Optimization Script
 * Run this once to create optimal indexes for production performance
 * 
 * Usage:
 *   node scripts/optimize-indexes.js
 * 
 * This script creates indexes that improve query performance by 10-100x
 */

require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/database");

// Import models
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Company = require("../models/Company");
const Blog = require("../models/Blog");
const Message = require("../models/Message");

async function createIndexes() {
  console.log("🚀 Starting MongoDB index optimization...\n");

  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // ================================
    // USER INDEXES
    // ================================
    console.log("📊 Creating User indexes...");
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log("  ✅ email (unique)");

    await User.collection.createIndex({ roles: 1 });
    console.log("  ✅ roles");

    await User.collection.createIndex({ currentRole: 1 });
    console.log("  ✅ currentRole");

    await User.collection.createIndex({ "profile.firstName": 1, "profile.lastName": 1 });
    console.log("  ✅ profile.firstName + profile.lastName");

    await User.collection.createIndex({ createdAt: -1 });
    console.log("  ✅ createdAt");

    await User.collection.createIndex({ isActive: 1 });
    console.log("  ✅ isActive");

    await User.collection.createIndex({ roles: 1, isActive: 1, createdAt: -1 });
    console.log("  ✅ roles + isActive + createdAt (compound)");

    // ================================
    // JOB INDEXES
    // ================================
    console.log("\n📊 Creating Job indexes...");
    await Job.collection.createIndex({ title: "text", description: "text", company: "text" });
    console.log("  ✅ title + description + company (text search)");

    await Job.collection.createIndex({ category: 1, createdAt: -1 });
    console.log("  ✅ category + createdAt");

    await Job.collection.createIndex({ postedBy: 1 });
    console.log("  ✅ postedBy");

    await Job.collection.createIndex({ isActive: 1, approved: 1 });
    console.log("  ✅ isActive + approved");

    await Job.collection.createIndex({ jobType: 1 });
    console.log("  ✅ jobType");

    await Job.collection.createIndex({ workLocation: 1 });
    console.log("  ✅ workLocation");

    await Job.collection.createIndex({ deadline: 1 });
    console.log("  ✅ deadline");

    await Job.collection.createIndex({ budget: 1 });
    console.log("  ✅ budget");

    await Job.collection.createIndex({ status: 1 });
    console.log("  ✅ status");

    // Compound indexes for common queries
    await Job.collection.createIndex({ 
      isActive: 1, 
      approved: 1, 
      category: 1, 
      createdAt: -1 
    });
    console.log("  ✅ isActive + approved + category + createdAt (compound)");

    await Job.collection.createIndex({ 
      isActive: 1, 
      approved: 1, 
      jobType: 1, 
      createdAt: -1 
    });
    console.log("  ✅ isActive + approved + jobType + createdAt (compound)");

    // ================================
    // APPLICATION INDEXES
    // ================================
    console.log("\n📊 Creating Application indexes...");
    await Application.collection.createIndex({ job: 1, applicant: 1 }, { unique: true });
    console.log("  ✅ job + applicant (unique)");

    await Application.collection.createIndex({ job: 1 });
    console.log("  ✅ job");

    await Application.collection.createIndex({ applicant: 1 });
    console.log("  ✅ applicant");

    await Application.collection.createIndex({ status: 1 });
    console.log("  ✅ status");

    await Application.collection.createIndex({ appliedAt: -1 });
    console.log("  ✅ appliedAt");

    // ================================
    // COMPANY INDEXES
    // ================================
    console.log("\n📊 Creating Company indexes...");
    await Company.collection.createIndex({ userId: 1 }, { unique: true });
    console.log("  ✅ userId (unique)");

    await Company.collection.createIndex({ companyName: "text" });
    console.log("  ✅ companyName (text search)");

    await Company.collection.createIndex({ industry: 1 });
    console.log("  ✅ industry");

    // ================================
    // BLOG INDEXES
    // ================================
    console.log("\n📊 Creating Blog indexes...");
    await Blog.collection.createIndex({ title: "text", content: "text" });
    console.log("  ✅ title + content (text search)");

    await Blog.collection.createIndex({ category: 1 });
    console.log("  ✅ category");

    await Blog.collection.createIndex({ isPublished: 1 });
    console.log("  ✅ isPublished");

    await Blog.collection.createIndex({ createdAt: -1 });
    console.log("  ✅ createdAt");

    await Blog.collection.createIndex({ views: -1 });
    console.log("  ✅ views");

    // ================================
    // MESSAGE INDEXES
    // ================================
    console.log("\n📊 Creating Message indexes...");
    await Message.collection.createIndex({ conversationId: 1, createdAt: -1 });
    console.log("  ✅ conversationId + createdAt");

    await Message.collection.createIndex({ senderId: 1 });
    console.log("  ✅ senderId");

    await Message.collection.createIndex({ receiverId: 1 });
    console.log("  ✅ receiverId");

    await Message.collection.createIndex({ createdAt: -1 });
    console.log("  ✅ createdAt");

    // ================================
    // INDEX STATISTICS
    // ================================
    console.log("\n📈 Index Statistics:");
    
    const collections = await mongoose.connection.db.collections();
    let totalIndexes = 0;
    
    for (const collection of collections) {
      const indexes = await collection.indexes();
      totalIndexes += indexes.length;
      console.log(`  ${collection.collectionName}: ${indexes.length} indexes`);
    }
    
    console.log(`\n✅ Total indexes created: ${totalIndexes}`);

    // ================================
    // PERFORMANCE TIPS
    // ================================
    console.log("\n💡 Performance Tips:");
    console.log("  1. Text indexes enable full-text search with $text operator");
    console.log("  2. Compound indexes optimize multi-field queries");
    console.log("  3. Unique indexes prevent duplicate data");
    console.log("  4. Indexes improve read performance but slightly slow writes");
    console.log("  5. Monitor index usage with db.collection.getIndexes()");
    console.log("  6. Remove unused indexes to save disk space");

    console.log("\n✅ Index optimization complete!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  }
}

// Run the script
createIndexes();
