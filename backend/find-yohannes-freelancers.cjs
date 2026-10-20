// Read-only: finds freelancer accounts matching "Yohannes Fikre" and their related data.
// Deletes nothing. Run: node backend/find-yohannes-freelancers.cjs
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const User = require("./models/User");
const Application = require("./models/Application");
const Message = require("./models/Message");
const Job = require("./models/Job");

dns.setServers(
  process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
    : ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
);

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex";
  const url = new URL(mongoUri);
  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/hustlex";
    mongoUri = url.toString();
  }
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  });
  console.log(`MongoDB connected: ${conn.connection.name}`);
};

const inspect = async () => {
  await connectDB();

  const or = [
    { "profile.firstName": { $regex: "yohannes", $options: "i" } },
    { "profile.lastName": { $regex: "fikre", $options: "i" } },
    { "telegram.firstName": { $regex: "yohannes", $options: "i" } },
    { "telegram.lastName": { $regex: "fikre", $options: "i" } },
    { "telegram.username": { $regex: "yohannes", $options: "i" } },
  ];

  const matches = await User.find({ $or: or }).sort({ createdAt: 1 }).lean();

  const totalUsers = await User.estimatedDocumentCount();
  const totalFreelancers = await User.countDocuments({ roles: "freelancer" });
  console.log(`\nTotal users: ${totalUsers} | total freelancers: ${totalFreelancers}`);
  console.log(`\nName/email matches for "Yohannes Fikre": ${matches.length}\n`);

  for (const u of matches) {
    const [applications, messages, jobs] = await Promise.all([
      Application.countDocuments({ applicant: u._id }),
      Message.countDocuments({ $or: [{ senderId: u._id }, { receiverId: u._id }] }),
      Job.countDocuments({ postedBy: u._id }),
    ]);
    console.log("─".repeat(60));
    console.log(`_id        : ${u._id}`);
    console.log(`name       : ${(u.profile?.firstName || "") + " " + (u.profile?.lastName || "")}`.trim());
    console.log(`email      : ${u.email || "(none)"}`);
    console.log(`roles      : ${JSON.stringify(u.roles)} (current: ${u.currentRole})`);
    console.log(`telegram   : ${u.telegram?.username || "(none)"} / ${u.telegram?.firstName || ""} ${u.telegram?.lastName || ""}`.trim());
    console.log(`slug       : ${u.slug || "(none)"}`);
    console.log(`created    : ${u.createdAt}`);
    console.log(`related    : ${applications} application(s), ${messages} message(s), ${jobs} posted job(s)`);
  }

  if (matches.length === 0) console.log("No matching accounts found.");
  if (matches.length > 0) {
    const freelancerMatches = matches.filter((u) => (u.roles || []).includes("freelancer"));
    console.log(`\nOf those, ${freelancerMatches.length} have the "freelancer" role.`);
  }

  await mongoose.connection.close();
};

inspect().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
