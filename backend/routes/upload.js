const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { saveUpload, deleteUpload, uploadsRoot, isS3Enabled } = require("../services/storage");
const {
  cvUpload,
  portfolioUpload,
  logoUpload,
  tradeLicenseUpload,
  avatarUpload,
  blogImageUpload,
  receiptUpload,
} = require("../lib/upload-multer");
const { optionalAuth } = require("../middleware/auth");
const User = require("../models/User");
const { parseCV } = require("../services/cvParser");
const {
  generateEmbedding,
  buildUserEmbeddingInput,
} = require("../services/embeddings");

if (!isS3Enabled() && !fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

async function respondWithUpload(req, res, folder, message) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await saveUpload(req.file, folder);
    res.json({
      message,
      fileUrl: result.fileUrl,
      storagePath: result.storagePath,
      fileName: result.fileName,
      originalName: result.originalName,
      size: result.size,
      storage: isS3Enabled() ? "s3" : "local",
    });
  } catch (error) {
    console.error(`${folder} upload error:`, error);
    res.status(500).json({
      message: `Failed to upload ${folder}`,
      error: error.message,
    });
  }
}

async function embedCvInBackground(userId, cvText, skills, primarySkill, bio) {
  try {
    const input = buildUserEmbeddingInput({ cvText, skills, primarySkill, bio });
    if (!input) return;
    const vector = await generateEmbedding(input);
    if (vector) {
      await User.updateOne(
        { _id: userId },
        { $set: { "profile.cvEmbedding": vector } }
      );
      console.log("🧠 CV embedding generated for user:", userId);
    }
  } catch (err) {
    console.error("CV embedding generation failed:", err.message);
  }
}

router.post("/cv", optionalAuth, cvUpload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await saveUpload(req.file, "cvs");

    let cvText = null;
    let cvParsed = false;
    try {
      const parsed = await parseCV(req.file.buffer, req.file.originalname);
      cvText = parsed.text;
      cvParsed = parsed.extracted;
    } catch (parseErr) {
      console.warn("CV text extraction skipped:", parseErr.message);
    }

    if (req.user) {
      const update = { "profile.cvUrl": result.fileUrl };
      if (cvText) {
        update["profile.cvText"] = cvText;
        update["profile.cvTextExtractedAt"] = new Date();
      } else {
        update["profile.cvText"] = "";
        update["profile.cvEmbedding"] = [];
      }
      User.updateOne({ _id: req.user._id }, { $set: update }).catch((err) =>
        console.error("Profile CV update failed:", err.message)
      );

      if (cvText) {
        const profile = req.user.profile || {};
        embedCvInBackground(
          req.user._id,
          cvText,
          profile.skills,
          profile.primarySkill,
          profile.bio
        );
      }
    }

    res.json({
      message: "CV uploaded successfully",
      fileUrl: result.fileUrl,
      storagePath: result.storagePath,
      fileName: result.fileName,
      originalName: result.originalName,
      size: result.size,
      storage: isS3Enabled() ? "s3" : "local",
      cvText,
      cvParsed,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    res.status(500).json({
      message: "Failed to upload CV",
      error: error.message,
    });
  }
});

router.post("/portfolio", portfolioUpload.single("portfolio"), (req, res) =>
  respondWithUpload(req, res, "portfolios", "Portfolio uploaded successfully")
);

router.post("/logo", logoUpload.single("logo"), (req, res) =>
  respondWithUpload(req, res, "logos", "Company logo uploaded successfully")
);

router.post("/trade-license", tradeLicenseUpload.single("tradeLicense"), (req, res) =>
  respondWithUpload(req, res, "trade-licenses", "Trade license uploaded successfully")
);

router.post("/avatar", avatarUpload.single("avatar"), (req, res) =>
  respondWithUpload(req, res, "avatars", "Avatar uploaded successfully")
);

router.post("/blog-image", blogImageUpload.single("blogImage"), (req, res) =>
  respondWithUpload(req, res, "blog-images", "Blog image uploaded successfully")
);

router.post("/receipt", receiptUpload.single("receipt"), (req, res) =>
  respondWithUpload(req, res, "receipts", "Payment receipt uploaded successfully")
);

router.get("/uploads/:folder/:filename", (req, res) => {
  if (isS3Enabled()) {
    return res.status(404).json({
      message: "Files are served via CDN/S3. Use the fileUrl returned from upload.",
    });
  }
  const { folder, filename } = req.params;
  const filePath = path.join(uploadsRoot, folder, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

router.get("/file/:fileName", (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(uploadsRoot, "cvs", fileName);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        fileName,
        size: stats.size,
        uploadedAt: stats.birthtime,
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("File info error:", error);
    res.status(500).json({ message: "Error getting file info" });
  }
});

router.delete("/file/:fileName", async (req, res) => {
  try {
    const storagePath = `/uploads/cvs/${req.params.fileName}`;
    await deleteUpload(storagePath);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
