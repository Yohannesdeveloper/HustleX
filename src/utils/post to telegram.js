const axios = require("axios");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHAT_ID;

async function postJobToTelegram(job) {
  if (!job.approved) return; // Only post approved jobs

  const message = `🚀 <b>New Job Posted!</b>
💼 <b>Title:</b> ${job.title}
🏢 <b>Company:</b> ${job.company || "Not specified"}
📍 <b>Location:</b> ${job.workLocation || "Remote"}
💰 <b>Budget:</b> ${job.budget || "Not specified"}
🔗 <b>Apply:</b> ${job.jobLink || "Not available"}`;

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: channelId,
      text: message,
      parse_mode: "HTML",
    });
    console.log("✅ Approved job posted to Telegram!");
  } catch (err) {
    console.error("❌ Telegram posting error:", err.message);
  }
}

module.exports = postJobToTelegram;
