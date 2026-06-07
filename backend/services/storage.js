const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "uploads");

function isS3Enabled() {
  return (
    process.env.S3_ENABLED === "true" &&
    Boolean(process.env.AWS_BUCKET_NAME) &&
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY)
  );
}

function getS3Client() {
  const { S3Client } = require("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function buildObjectKey(folder, filename) {
  return `${folder}/${filename}`;
}

/**
 * Public URL for a stored object (CDN > S3 base > API-relative path).
 */
function resolvePublicUrl(storagePath) {
  if (!storagePath) return "";
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  const normalized = storagePath.startsWith("/") ? storagePath : `/${storagePath}`;

  if (process.env.CDN_URL) {
    const base = process.env.CDN_URL.replace(/\/$/, "");
    return `${base}${normalized}`;
  }

  if (isS3Enabled() && process.env.AWS_S3_PUBLIC_URL_BASE) {
    const base = process.env.AWS_S3_PUBLIC_URL_BASE.replace(/\/$/, "");
    const key = normalized.replace(/^\/uploads\//, "");
    return `${base}/${key}`;
  }

  const apiBase = (process.env.API_PUBLIC_URL || process.env.ORIGIN_URL || "").replace(/\/$/, "");
  if (apiBase) {
    return `${apiBase}${normalized}`;
  }

  return normalized;
}

/**
 * Save multer memory file to S3 or local disk. Returns paths for DB + client.
 */
async function saveUpload(file, folder) {
  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}_${safeName}`;
  const storagePath = `/uploads/${folder}/${filename}`;
  const objectKey = buildObjectKey(folder, filename);

  if (isS3Enabled()) {
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=604800",
      })
    );
    console.log(`☁️  S3 upload: s3://${process.env.AWS_BUCKET_NAME}/${objectKey}`);
  } else {
    const dir = path.join(uploadsRoot, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), file.buffer);
  }

  return {
    storagePath,
    fileUrl: resolvePublicUrl(storagePath),
    fileName: filename,
    originalName: file.originalname,
    size: file.size,
  };
}

async function deleteUpload(storagePath) {
  if (!storagePath) return;
  if (/^https?:\/\//i.test(storagePath)) return;

  const match = storagePath.match(/^\/uploads\/([^/]+)\/(.+)$/);
  if (!match) return;

  const [, folder, filename] = match;

  if (isS3Enabled()) {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: buildObjectKey(folder, filename),
      })
    );
    return;
  }

  const filePath = path.join(uploadsRoot, folder, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  isS3Enabled,
  saveUpload,
  deleteUpload,
  resolvePublicUrl,
  uploadsRoot,
};
