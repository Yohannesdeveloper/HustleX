const axios = require("axios");
const Company = require("./models/Company");

function normalizeChatId(chatId) {
  if (!chatId) return null;
  const trimmed = String(chatId).trim();
  if (!trimmed) return null;
  return trimmed;
}

function getTargetChatIds() {
  const primary = normalizeChatId(process.env.TELEGRAM_CHAT_ID);
  const extraRaw = process.env.TELEGRAM_CHAT_IDS; // comma-separated (optional)

  const extra = (extraRaw ? String(extraRaw).split(",") : [])
    .map((s) => normalizeChatId(s))
    .filter(Boolean);

  return Array.from(new Set([primary, ...extra].filter(Boolean)));
}

async function sendTelegramMessage({ botToken, chatId, message, inlineKeyboard = null }) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  // Add inline keyboard if provided
  if (inlineKeyboard) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard
    };
  }

  return axios.post(url, payload);
}

function normalizeUsername(value) {
  if (!value) return "";
  return String(value).trim().replace(/^@/, "");
}

/**
 * Builds a Telegram Mini App "direct link" so the Apply button opens the job
 * inside Telegram as a Mini App instead of an external browser tab.
 *
 * Format: https://t.me/<bot>/<appShortName>?startapp=<param>
 *   - <appShortName> is optional; when omitted Telegram opens the bot's Main Mini App.
 * The start parameter is read on the web side via Telegram.WebApp.initDataUnsafe.start_param.
 * Only A-Z, a-z, 0-9, _ and - are allowed in the start parameter, so a Mongo ObjectId is safe.
 */
function buildMiniAppLink(jobId) {
  const botUsername = normalizeUsername(process.env.TELEGRAM_BOT_USERNAME || "HustleXet_bot");
  if (!botUsername || !jobId) return "";
  const appShortName = normalizeUsername(process.env.TELEGRAM_MINI_APP_SHORTNAME);
  const startParam = `job_${jobId}`;
  const base = appShortName
    ? `https://t.me/${botUsername}/${appShortName}`
    : `https://t.me/${botUsername}`;
  return `${base}?startapp=${startParam}`;
}

function escapeHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Posts an approved job to Telegram chats with full job details.
 *
 * Configure:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID (channel username like @YourChannel OR numeric chat id)
 * - TELEGRAM_CHAT_IDS (optional, comma-separated additional chat ids/usernames)
 * - CLIENT_URL (optional, e.g. https://www.hustlex.com for job links)
 */
async function postJobToTelegram(job) {
  console.log("📤 postJobToTelegram called for job:", job?._id);
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatIds = getTargetChatIds();

  console.log("Telegram config:");
  console.log("  TELEGRAM_BOT_TOKEN set?", !!botToken);
  console.log("  TELEGRAM_CHAT_IDs:", chatIds);

  if (!botToken) {
    console.warn("Telegram: TELEGRAM_BOT_TOKEN not set; skipping post.");
    return;
  }

  if (chatIds.length === 0) {
    console.warn("Telegram: TELEGRAM_CHAT_ID not set; skipping post.");
    return;
  }

  // Telegram web_app inline buttons require HTTPS — always prefer a production URL
  // Even when running locally, Telegram won't accept HTTP URLs in web_app buttons
  const baseUrl = (process.env.CLIENT_URL || process.env.PRODUCTION_CLIENT_URL || process.env.CLIENT_URL_PRODUCTION || "https://www.hustlex.com").replace(/\/$/, "");
  const jobId = job?._id ? String(job._id) : "";
  const jobLink = jobId ? `${baseUrl}/job-details/${jobId}` : "";
  console.log("Job details:");
  console.log("  Job ID:", jobId);
  console.log("  Job title:", job?.title);
  console.log("  Job link:", jobLink);

  // Check if company has valid tax ID
  let hasValidTaxId = false;
  try {
    const company = await Company.findOne({ userId: job?.postedBy });
    hasValidTaxId = !!(company?.taxId && String(company.taxId).trim());
  } catch (err) {
    console.warn("Telegram: could not check company taxId:", err?.message);
  }

  const taxBadge = hasValidTaxId ? " ✅ (Verified Tax ID)" : "";

  const descPreview = job?.description
    ? String(job.description).replace(/\s+/g, " ").trim().slice(0, 300) + (job.description.length > 300 ? "…" : "")
    : "";

  const lines = [
    `🚀 <b>New Job Approved!</b>`,
    "",
    `💼 <b>Job Title:</b> ${escapeHtml(job?.title || "Not specified")}${taxBadge}`,
    "",
    `📌 <b>Job Type:</b> ${escapeHtml(job?.jobType || "Not specified")}`,
    "",
    `🏭 <b>Job Sector:</b> ${escapeHtml(job?.jobSector || "Not specified")}`,
    "",
    `📝 <b>Short Description:</b>`,
    "",
    `${descPreview ? escapeHtml(descPreview) : "Not specified"}`,
    "",
    `📍 <b>Location:</b> ${escapeHtml(job?.city || "Not specified")}`,
    "",
    `💰 <b>Budget:</b> ${escapeHtml(job?.budget || "Not specified")}`,
    job?.jobLink ? `🔗 <b>External Link:</b> <a href="${job.jobLink}">${escapeHtml(job.jobLink)}</a>` : null,
    "",
    "—",
    '<a href="https://www.hustleX.com">www.hustleX.com</a> | <a href="https://t.me/HustleXet">@HustleXet</a> | <a href="https://t.me/HustleXsupport">@HustleXsupport</a> | <a href="https://t.me/HustleXet_bot">@HustleXet_bot</a>',
  ].flat().filter((x) => x != null);

  const message = lines.join("\n");

  // Inline keyboard — use web_app only when HTTPS is available (required by Telegram)
  const applyUrl = `${baseUrl}/job-details/${jobId}`;
  let inlineKeyboard;
  if (baseUrl.startsWith("https://")) {
    inlineKeyboard = [[{ text: "🚀 Apply for this job", web_app: { url: `${baseUrl}/ApplyRedirect?redirect=${encodeURIComponent(`/job-details/${jobId}`)}` } }]];
  } else {
    inlineKeyboard = [[{ text: "🚀 Apply for this job", url: applyUrl }]];
  }

  // Send to all configured chats
  const results = await Promise.allSettled(
    chatIds.map((chatId) => sendTelegramMessage({ botToken, chatId, message, inlineKeyboard }))
  );

  const okCount = results.filter((r) => r.status === "fulfilled").length;
  const failCount = results.length - okCount;

  if (okCount > 0) {
    console.log(`Telegram: successfully posted job ${jobId} to ${okCount} chat(s).`);
  }
  if (failCount > 0) {
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r, idx) => ({ chatId: chatIds[idx], detail: r.reason?.response?.data || r.reason?.message || r.reason }));
    errors.forEach((e) => console.error(`Telegram: failed to post job ${jobId} to chat ${e.chatId}.`, e.detail));
    if (okCount === 0) {
      throw new Error(errors.map((e) => JSON.stringify(e.detail)).join("; "));
    }
  }
}

module.exports = postJobToTelegram;
