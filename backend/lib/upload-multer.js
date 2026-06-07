const multer = require("multer");

const memory = multer.memoryStorage();

function createUpload({ maxSize, allowedMimes, errorMessage }) {
  return multer({
    storage: memory,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(errorMessage), false);
      }
    },
  });
}

const MIME = {
  cv: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  portfolio: [
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
  ],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  tradeLicense: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

module.exports = {
  cvUpload: createUpload({
    maxSize: 5 * 1024 * 1024,
    allowedMimes: MIME.cv,
    errorMessage: "Invalid file type. Only PDF, DOC, and DOCX are allowed.",
  }),
  portfolioUpload: createUpload({
    maxSize: 10 * 1024 * 1024,
    allowedMimes: MIME.portfolio,
    errorMessage: "Invalid portfolio file type.",
  }),
  logoUpload: createUpload({
    maxSize: 5 * 1024 * 1024,
    allowedMimes: MIME.image,
    errorMessage: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for logos.",
  }),
  tradeLicenseUpload: createUpload({
    maxSize: 10 * 1024 * 1024,
    allowedMimes: MIME.tradeLicense,
    errorMessage: "Invalid trade license file type.",
  }),
  avatarUpload: createUpload({
    maxSize: 5 * 1024 * 1024,
    allowedMimes: MIME.image,
    errorMessage: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for avatars.",
  }),
  blogImageUpload: createUpload({
    maxSize: 10 * 1024 * 1024,
    allowedMimes: MIME.image,
    errorMessage: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed for blog images.",
  }),
};
