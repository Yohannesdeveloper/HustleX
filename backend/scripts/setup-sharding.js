/**
 * MongoDB Sharding Configuration Script
 * Run this to set up sharded cluster for 1M+ users
 * 
 * Prerequisites:
 * - MongoDB sharded cluster deployed (Atlas or self-hosted)
 * - 3 Config servers
 * - 2+ mongos routers
 * - 3+ Shards (each shard is a replica set)
 * 
 * Usage:
 *   mongosh --host <mongos-host> --port 27017 < scripts/setup-sharding.js
 */

// ================================
// Enable Sharding for Database
// ================================
print("🚀 Enabling sharding for HustleX database...");

// Enable sharding on the database
sh.enableSharding("hustlex");

// ================================
// Shard Collections
// ================================

// 1. Users Collection
// Shard Key: hashed userId (even distribution)
print("\n📊 Sharding users collection...");
sh.shardCollection("hustlex.users", { _id: "hashed" }, {
  numInitialChunks: 100,
  collation: { locale: "simple" }
});

// 2. Jobs Collection
// Shard Key: hashed jobId (even distribution)
print("📊 Sharding jobs collection...");
sh.shardCollection("hustlex.jobs", { _id: "hashed" }, {
  numInitialChunks: 200,
  collation: { locale: "simple" }
});

// 3. Applications Collection
// Shard Key: compound (jobId + applicantId)
print("📊 Sharding applications collection...");
sh.shardCollection("hustlex.applications", { jobId: 1, applicantId: 1 }, {
  numInitialChunks: 150,
  collation: { locale: "simple" }
});

// 4. Messages Collection
// Shard Key: hashed conversationId
print("📊 Sharding messages collection...");
sh.shardCollection("hustlex.messages", { conversationId: "hashed" }, {
  numInitialChunks: 300,
  collation: { locale: "simple" }
});

// 5. Companies Collection
// Shard Key: hashed userId
print("📊 Sharding companies collection...");
sh.shardCollection("hustlex.companies", { userId: "hashed" }, {
  numInitialChunks: 50,
  collation: { locale: "simple" }
});

// 6. Blogs Collection
// Shard Key: hashed blogId
print("📊 Sharding blogs collection...");
sh.shardCollection("hustlex.blogs", { _id: "hashed" }, {
  numInitialChunks: 50,
  collation: { locale: "simple" }
});

// ================================
// Create Indexes on Shard Keys
// ================================
print("\n🔧 Creating shard key indexes...");

// Users
db.users.createIndex({ _id: "hashed" });

// Jobs
db.jobs.createIndex({ _id: "hashed" });
db.jobs.createIndex({ postedBy: 1 }); // For user's jobs
db.jobs.createIndex({ category: 1, createdAt: -1 }); // For browsing

// Applications
db.applications.createIndex({ jobId: 1, applicantId: 1 }, { unique: true });
db.applications.createIndex({ applicantId: 1 }); // For user's applications

// Messages
db.messages.createIndex({ conversationId: "hashed" });
db.messages.createIndex({ createdAt: -1 }); // For sorting

// Companies
db.companies.createIndex({ userId: "hashed" }, { unique: true });

// Blogs
db.blogs.createIndex({ _id: "hashed" });
db.blogs.createIndex({ category: 1 });
db.blogs.createIndex({ createdAt: -1 });

// ================================
// Configure Balancer
// ================================
print("\n⚖️  Configuring balancer...");

// Start balancer
sh.startBalancer();

// Set balancer window (during low traffic hours)
// 2 AM - 6 AM UTC
sh.setBalancerState(true);
db.settings.updateOne(
  { _id: "balancer" },
  {
    $set: {
      activeWindow: { start: "02:00", stop: "06:00" }
    }
  },
  { upsert: true }
);

// ================================
// Configure Chunk Size
// ================================
print("📏 Setting chunk size...");

// Default is 64MB, reduce to 32MB for better distribution
db.settings.updateOne(
  { _id: "chunksize" },
  { $set: { value: 32 } },
  { upsert: true }
);

// ================================
// Verify Sharding Setup
// ================================
print("\n✅ Verifying sharding setup...\n");

// Print sharding status
printjson(sh.status());

// Print collection stats
print("\n📈 Collection Sharding Status:");
const collections = ["users", "jobs", "applications", "messages", "companies", "blogs"];
collections.forEach(collection => {
  const stats = db.getCollection(collection).stats();
  print(`\n${collection}:`);
  print(`  - Sharded: ${stats.sharded || false}`);
  print(`  - Documents: ${stats.count}`);
  print(`  - Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  print(`  - Indexes: ${stats.nindexes}`);
});

// ================================
// Tag Awareness (Optional)
// ================================
print("\n🏷️  Setting up zone awareness...");

// Tag shards by region
sh.addShardTag("shard0000", "US-EAST");
sh.addShardTag("shard0001", "US-WEST");
sh.addShardTag("shard0002", "EU-WEST");

// Tag ranges for data locality
// sh.updateZoneKeyRange("hustlex.users", { _id: MinKey }, { _id: MaxKey }, "US-EAST");

// ================================
// Monitoring Setup
// ================================
print("\n📊 Sharding setup complete!");
print("\nMonitoring Commands:");
print("  - sh.status() - View sharding status");
print("  - db.collection.getShardDistribution() - View data distribution");
print("  - db.currentOp() - View active operations");
print("  - sh.isBalancerRunning() - Check balancer status");

print("\n⚠️  Important Notes:");
print("  1. Monitor chunk migration during balancer window");
print("  2. Watch for jumbo chunks (> 32MB)");
print("  3. Ensure queries include shard keys for efficiency");
print("  4. Use explain() to verify queries use shard keys");
print("  5. Monitor config server performance");

print("\n✅ MongoDB sharding configuration complete!\n");
