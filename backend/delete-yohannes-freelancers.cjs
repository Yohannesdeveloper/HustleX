// Deletes the 10 secondary "Yohannes Fikre" test accounts + their applications,
// messages and portfolio projects. yohannesfk123@gmail.com is EXCLUDED by design.
// Dry run:  node delete-yohannes-freelancers.cjs
// Execute:  node delete-yohannes-freelancers.cjs --yes
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const User = require("./models/User");
const Application = require("./models/Application");
const Message = require("./models/Message");
const Project = require("./models/Project");

const APPLY = process.argv.includes("--yes");

// Accounts to remove (confirmed by the owner on 2026-10-20).
const TARGET_EMAILS = [
  "yohannesfk111@gmail.com",
  "yohannesfk222@gmail.com",
  "yohannes111@gmail.com",
  "yohannesfk1212@gmail.com",
  "yohannesfk2121@gmail.com",
  "yohannesfk6677@gmail.com",
  "yohannesfk333@gmail.com",
  "yohannesfk212@gmail.com",
  "yohannes667@gmail.com",
  "yohannesfk4554@gmail.com",
];

// Never touched, even if it appears in a future broader query.
const PROTECTED_EMAILS = ["yohannesfk123@gmail.com"];

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

const run = async () => {
  await connectDB();

  const users = await User.find({ email: { $in: TARGET_EMAILS } }).lean();
  console.log(`\nEmail allowlist entries found in DB: ${users.length}/${TARGET_EMAILS.length}`);

  const deletable = [];
  for (const u of users) {
    const name = `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.toLowerCase();
    const isProtected = PROTECTED_EMAILS.includes(u.email);
    const isAdmin = (u.roles || []).includes("admin");
    const looksLikeYohannes = name.includes("yohannes") || name.includes("fikre");

    if (isProtected) {
      console.log(`  🛡️  SKIPPED (protected): ${u.email}`);
    } else if (isAdmin) {
      console.log(`  🛡️  SKIPPED (admin role): ${u.email}`);
    } else if (!looksLikeYohannes) {
      console.log(`  🛡️  SKIPPED (name mismatch "${name.trim()}"): ${u.email}`);
    } else {
      deletable.push(u);
    }
  }

  const ids = deletable.map((u) => u._id);
  const [appCount, msgCount, projCount] = ids.length
    ? await Promise.all([
        Application.countDocuments({ applicant: { $in: ids } }),
        Message.countDocuments({ $or: [{ senderId: { $in: ids } }, { receiverId: { $in: ids } }] }),
        Project.countDocuments({ freelancer: { $in: ids } }),
      ])
    : [0, 0, 0];

  console.log(`\nWill delete: ${deletable.length} users, ${appCount} applications, ${msgCount} messages, ${projCount} projects`);
  deletable.forEach((u) => console.log(`  - ${u.email} (${(u.roles || []).join("/")})`));

  if (!APPLY) {
    console.log("\nDry run only — pass --yes to execute. No changes written.");
    await mongoose.connection.close();
    return;
  }

  console.log("\n🗑️  Deleting...");
  if (ids.length) {
    const apps = await Application.deleteMany({ applicant: { $in: ids } });
    console.log(`  applications deleted: ${apps.deletedCount}`);
    const msgs = await Message.deleteMany({
      $or: [{ senderId: { $in: ids } }, { receiverId: { $in: ids } }],
    });
    console.log(`  messages deleted: ${msgs.deletedCount}`);
    const projs = await Project.deleteMany({ freelancer: { $in: ids } });
    console.log(`  projects deleted: ${projs.deletedCount}`);
    const usersDel = await User.deleteMany({ _id: { $in: ids } });
    console.log(`  users deleted: ${usersDel.deletedCount}`);
  }

  const remainingMatch = await User.find({
    $or: [
      { "profile.firstName": { $regex: "yohannes", $options: "i" } },
      { "profile.lastName": { $regex: "fikre", $options: "i" } },
      { "telegram.firstName": { $regex: "yohannes", $options: "i" } },
    ],
  }).lean();
  console.log(`\n✅ Done. Users still matching "Yohannes Fikre": ${remainingMatch.length}`);
  remainingMatch.forEach((u) => console.log(`  - ${u.email} (${(u.roles || []).join("/")})`));
  console.log(`Remaining total users: ${await User.estimatedDocumentCount()}`);

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
