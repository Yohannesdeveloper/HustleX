const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for CV uploads
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cvDir = path.join(uploadsDir, "cvs");
    if (!fs.existsSync(cvDir)) {
      fs.mkdirSync(cvDir, { recursive: true });
    }
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

// Configure multer for Portfolio uploads
const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const portfolioDir = path.join(uploadsDir, "portfolios");
    if (!fs.existsSync(portfolioDir)) {
      fs.mkdirSync(portfolioDir, { recursive: true });
    }
    cb(null, portfolioDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

// Configure multer for Company Logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const logoDir = path.join(uploadsDir, "logos");
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

// Configure multer for Trade License uploads
const tradeLicenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tradeLicenseDir = path.join(uploadsDir, "trade-licenses");
    if (!fs.existsSync(tradeLicenseDir)) {
      fs.mkdirSync(tradeLicenseDir, { recursive: true });
    }
    cb(null, tradeLicenseDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

// Configure multer for Avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(uploadsDir, "avatars");
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."),
        false
      );
    }
  },
});

const portfolioUpload = multer({
  storage: portfolioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/zip",
      "application/x-rar-compressed",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF, ZIP, and RAR are allowed."),
        false
      );
    }
  },
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for logos."),
        false
      );
    }
  },
});

const tradeLicenseUpload = multer({
  storage: tradeLicenseStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed for trade licenses."),
        false
      );
    }
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for avatars."),
        false
      );
    }
  },
});

// CV upload endpoint
router.post("/cv", cvUpload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/cvs/${req.file.filename}`;

    res.json({
      message: "CV uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    res.status(500).json({
      message: "Failed to upload CV",
      error: error.message,
    });
  }
});

// Portfolio upload endpoint
router.post("/portfolio", portfolioUpload.single("portfolio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/portfolios/${req.file.filename}`;

    res.json({
      message: "Portfolio uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("Portfolio upload error:", error);
    res.status(500).json({
      message: "Failed to upload portfolio",
      error: error.message,
    });
  }
});

// Company Logo upload endpoint
router.post("/logo", logoUpload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/logos/${req.file.filename}`;

    res.json({
      message: "Company logo uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({
      message: "Failed to upload company logo",
      error: error.message,
    });
  }
});

// Trade License upload endpoint
router.post("/trade-license", tradeLicenseUpload.single("tradeLicense"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/trade-licenses/${req.file.filename}`;

    res.json({
      message: "Trade license uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("Trade license upload error:", error);
    res.status(500).json({
      message: "Failed to upload trade license",
      error: error.message,
    });
  }
});

// Avatar upload endpoint
router.post("/avatar", avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    res.json({
      message: "Avatar uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
});

// Configure multer for Blog Image uploads
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const blogImageDir = path.join(uploadsDir, "blog-images");
    if (!fs.existsSync(blogImageDir)) {
      fs.mkdirSync(blogImageDir, { recursive: true });
    }
    cb(null, blogImageDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

const blogImageUpload = multer({
  storage: blogImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for blog images."),
        false
      );
    }
  },
});

// Blog Image upload endpoint
router.post("/blog-image", blogImageUpload.single("blogImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/blog-images/${req.file.filename}`;

    res.json({
      message: "Blog image uploaded successfully",
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    console.error("Blog image upload error:", error);
    res.status(500).json({
      message: "Failed to upload blog image",
      error: error.message,
    });
  }
});

// Serve uploaded files
router.get("/uploads/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(uploadsDir, folder, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// Get CV file info
router.get("/file/:fileName", (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(uploadsDir, "cvs", fileName);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        fileName,
        size: stats.size,
        uploadedAt: stats.birthtime,
        path: filePath,
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("File info error:", error);
    res.status(500).json({ message: "Error getting file info" });
  }
});

// Delete CV
router.delete("/file/:fileName", (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(uploadsDir, "cvs", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
