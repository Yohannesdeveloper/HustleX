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

router.post("/cv", cvUpload.single("cv"), (req, res) =>
  respondWithUpload(req, res, "cvs", "CV uploaded successfully")
);

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
