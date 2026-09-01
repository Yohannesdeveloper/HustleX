const axios = require("axios");
require("dotenv").config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function deleteWebhook() {
  try {
    console.log("🔍 Deleting Telegram webhook...");
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/deleteWebhook`,
      { drop_pending_updates: true }
    );
    console.log("✅ Webhook deleted:", response.data);
  } catch (error) {
    console.error("❌ Error deleting webhook:", error.response?.data || error.message);
  }
}

deleteWebhook();
