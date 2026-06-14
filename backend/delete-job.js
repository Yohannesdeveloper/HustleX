/**
 * delete-job.js
 * Deletes a job from the database.
 * Run with: node delete-job.js [job-id]
 * Or list all jobs: node delete-job.js --list
 */
const mongoose = require("mongoose");
const Job = require("./models/Job");

// Load env from backend .env
require("dotenv").config({ path: __dirname + "/.env" });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const jobId = args[0];

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log("✅ Connected!");

  if (jobId === "--list" || !jobId) {
    // List all jobs
    console.log("\n📋 All jobs in database:");
    const jobs = await Job.find().select("_id title status createdAt").sort({ createdAt: -1 });
    if (jobs.length === 0) {
      console.log("No jobs found.");
    } else {
      jobs.forEach((job) => {
        console.log(`- ${job._id} | ${job.title} | ${job.status} | ${job.createdAt}`);
      });
    }
  } else {
    // Delete specific job
    const result = await Job.deleteOne({ _id: jobId });
    if (result.deletedCount === 0) {
      console.error(`❌ Job not found with ID: ${jobId}`);
      process.exit(1);
    } else {
      console.log(`✅ Job deleted successfully! ID: ${jobId}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
