const axios = require("axios");
const Company = require("./models/Company");

function normalizeChatId(chatId) {
  if (!chatId) return null;
  const trimmed = String(chatId).trim();
  if (!trimmed) return null;
  return trimmed;
}

function getTargetChatIds() {
  // Split by comma so users can put multiple IDs in either env var
  const fromPrimary = (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => normalizeChatId(s))
    .filter(Boolean);

  const fromExtra = (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((s) => normalizeChatId(s))
    .filter(Boolean);

  return Array.from(new Set([...fromPrimary, ...fromExtra]));
}

async function sendTelegramMessage({ botToken, chatId, message, inlineKeyboard = null }) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (inlineKeyboard) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard
    };
  }

  console.log(`[sendTelegramMessage] SENDING to ${chatId}:`, JSON.stringify({ url, payload }));
  try {
    const res = await axios.post(url, payload);
    console.log(`[sendTelegramMessage] OK ${chatId}:`, JSON.stringify(res.data));
    return res;
  } catch (err) {
    console.error(`[sendTelegramMessage] ERROR ${chatId}:`, err?.response?.data || err?.message);
    throw err;
  }
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

  // Determine the public-facing URL for Telegram inline keyboard links.
  // Telegram requires HTTPS for web_app buttons. CLIENT_URL is often localhost
  // on Railway, so we always prefer PRODUCTION_CLIENT_URL or the hardcoded domain.
  const baseUrl = (
    process.env.PRODUCTION_CLIENT_URL ||
    process.env.CLIENT_URL_PRODUCTION ||
    'https://hustlexet.vercel.app'
  ).replace(/\/+$/, "");
  const jobId = job?._id ? String(job._id) : "";
  const jobLink = jobId ? `${baseUrl}/job-details/${jobId}` : "";
  console.log("Job details:");
  console.log("  baseUrl (from env):", baseUrl);
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

  const jobUrl = `${baseUrl}/job-details/${jobId}`;
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME || 'HustleXet_bot').replace(/^@/, '');
  const channelMiniAppUrl = `https://t.me/${botUsername}/app?startapp=apply_${jobId}`;
  console.log("  Job URL:", jobUrl);
  console.log("  Channel Mini App URL:", channelMiniAppUrl);

  const results = await Promise.allSettled(
    chatIds.map((chatId) => {
      const isChannel = String(chatId).startsWith("-100") || String(chatId).startsWith("@");
      const button = isChannel
        ? { text: "🚀 Apply for this job", url: channelMiniAppUrl }
        : { text: "🚀 Apply for this job", web_app: { url: jobUrl } };
      const inlineKeyboard = [[button]];
      console.log(`  Chat ${chatId} (${isChannel ? "channel" : "private"}): ${isChannel ? "mini-app" : "web_app"} button`);
      return sendTelegramMessage({ botToken, chatId, message, inlineKeyboard });
    })
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
