#!/usr/bin/env node
/**
 * Verify AWS S3 + SES credentials before enabling in production.
 * Usage: node scripts/verify-aws.js
 *
 * Prerequisite: fill AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME in .env
 */
require("dotenv").config();

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.AWS_BUCKET_NAME;
const fromEmail = (process.env.EMAIL_FROM || "").replace(/.*<([^>]+)>.*/, "$1").trim() || process.env.EMAIL_FROM;

function creds() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    console.error("❌ Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in backend/.env");
    process.exit(1);
  }
  return { accessKeyId, secretAccessKey };
}

async function verifyS3() {
  console.log("\n📦 S3");
  if (!bucket) {
    console.log("  ❌ AWS_BUCKET_NAME not set");
    return false;
  }

  const { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
  const client = new S3Client({ region, credentials: creds() });

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`  ✅ Bucket accessible: ${bucket} (${region})`);
  } catch (err) {
    console.log(`  ❌ Bucket check failed: ${err.message}`);
    console.log("     Create bucket in AWS Console → S3 → Create bucket");
    return false;
  }

  const testKey = `_hustlex-verify/${Date.now()}.txt`;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: "hustlex-aws-verify",
        ContentType: "text/plain",
      })
    );
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }));
    console.log("  ✅ Write/delete test passed");
  } catch (err) {
    console.log(`  ❌ Upload test failed: ${err.message}`);
    console.log("     IAM user needs s3:PutObject, s3:DeleteObject, s3:ListBucket");
    return false;
  }

  const publicBase =
    process.env.AWS_S3_PUBLIC_URL_BASE ||
    `https://${bucket}.s3.${region}.amazonaws.com`;
  console.log(`  ℹ️  Set AWS_S3_PUBLIC_URL_BASE=${publicBase}`);
  if (process.env.CDN_URL) {
    console.log(`  ℹ️  CDN_URL=${process.env.CDN_URL}`);
  }
  return true;
}

async function verifySes() {
  console.log("\n📧 SES");
  const {
    SESClient,
    GetAccountSendingEnabledCommand,
    GetIdentityVerificationAttributesCommand,
  } = require("@aws-sdk/client-ses");
  const client = new SESClient({ region, credentials: creds() });

  try {
    const enabled = await client.send(new GetAccountSendingEnabledCommand({}));
    console.log(`  ✅ SES account sending: ${enabled.Enabled ? "enabled" : "disabled"}`);
  } catch (err) {
    console.log(`  ❌ SES access failed: ${err.message}`);
    console.log("     IAM user needs ses:GetAccountSendingEnabled, ses:SendEmail");
    return false;
  }

  if (!fromEmail || !fromEmail.includes("@")) {
    console.log("  ⚠️  Set EMAIL_FROM=noreply@yourdomain.com in .env");
    return false;
  }

  const domain = fromEmail.split("@")[1];
  const identities = [fromEmail, domain];
  const attrs = await client.send(
    new GetIdentityVerificationAttributesCommand({ Identities: identities })
  );

  const emailStatus = attrs.VerificationAttributes?.[fromEmail]?.VerificationStatus;
  const domainStatus = attrs.VerificationAttributes?.[domain]?.VerificationStatus;

  if (domainStatus === "Success") {
    console.log(`  ✅ Domain verified: ${domain}`);
    return true;
  }
  if (emailStatus === "Success") {
    console.log(`  ✅ Email verified: ${fromEmail}`);
    return true;
  }

  console.log(`  ⚠️  Not verified yet: ${fromEmail} (status: ${emailStatus || "none"})`);
  console.log(`  ⚠️  Domain ${domain} status: ${domainStatus || "none"}`);
  console.log("     AWS Console → SES → Verified identities → Create identity");
  console.log("     Add DNS records (DKIM) to your domain registrar");
  return false;
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  HustleX AWS Verification (S3 + SES)");
  console.log("═══════════════════════════════════════");

  const s3Ok = await verifyS3();
  const sesOk = await verifySes();

  console.log("\n───────────────────────────────────────");
  if (s3Ok && sesOk) {
    console.log("✅ AWS ready. Add to backend/.env:");
    console.log("   S3_ENABLED=true");
    console.log("   EMAIL_PROVIDER=ses");
    console.log("   CDN_ENABLED=true   (optional, if CloudFront is set up)");
    console.log("\nThen restart API + worker.");
  } else {
    console.log("⚠️  Complete AWS setup above, then re-run:");
    console.log("   npm run scale:aws");
  }
  console.log("───────────────────────────────────────\n");

  process.exit(s3Ok && sesOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
