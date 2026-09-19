/**
 * migrate-blog-images.js
 *
 * Re-uploads local blog images to Railway backend and updates MongoDB
 * with the new absolute URLs. Fixes broken images on production.
 *
 * Usage (run from the project root /HustleX directory):
 *   node backend/scripts/migrate-blog-images.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

const RAILWAY_URL = "https://hustlex-production.up.railway.app";
const ADMIN_CODE = process.env.ADMIN_CODE || "BlogPost";
const LOCAL_UPLOADS = path.join(__dirname, "..", "uploads", "blog-images");

async function uploadFile(filePath, filename) {
  const { FormData, File } = await import("node:buffer").catch(() => null) || {};
  
  // Use native fetch (Node 18+)
  const blob = new Blob([fs.readFileSync(filePath)]);
  const formData = new FormData();
  formData.append("blogImage", blob, filename);

  const res = await fetch(`${RAILWAY_URL}/api/upload/blog-image`, {
    method: "POST",
    headers: { "x-admin-code": ADMIN_CODE },
    body: formData,
  });
  return res;
}

async function main() {
  console.log("?? Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("? Connected\n");

  const blogs = await Blog.find({ imageUrl: { $regex: /^\/uploads\// } });
  console.log(`?? Found ${blogs.length} blog(s) with relative image URLs\n`);

  for (const blog of blogs) {
    const filename = path.basename(blog.imageUrl);
    const localFile = path.join(LOCAL_UPLOADS, filename);

    if (!fs.existsSync(localFile)) {
      console.warn(`??  [${blog.title}] Local file missing: ${filename} — SKIPPING`);
      continue;
    }

    console.log(`?? [${blog.title}] Uploading: ${filename}`);
    try {
      const res = await uploadFile(localFile, filename);
      if (!res.ok) {
        const t = await res.text();
        console.error(`  ? Failed (${res.status}): ${t}`);
        continue;
      }
      const data = await res.json();
      console.log(`  ? Uploaded ? ${data.fileUrl}`);
      await Blog.findByIdAndUpdate(blog._id, { imageUrl: data.fileUrl });
      console.log(`  ?? DB updated\n`);
    } catch (err) {
      console.error(`  ? Error: ${err.message}`);
    }
  }

  console.log("?? Done!");
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
