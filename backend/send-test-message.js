
const axios = require("axios");
require("dotenv").config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const yourUserId = "339941145"; // Your user ID

async function sendTestMessage() {
  try {
    console.log("🤖 Sending test message to your Telegram ID:", yourUserId);
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: yourUserId,
      text: "🔧 Test message from HustleX! If you received this, the bot can message you!",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Accept", callback_data: "test_accept" },
            { text: "❌ Decline", callback_data: "test_decline" }
          ]
        ]
      }
    });
    console.log("✅ Test message sent successfully!", response.data);
  } catch (error) {
    console.error("❌ Error sending test message:", error.response?.data || error.message);
  }
}

sendTestMessage();
