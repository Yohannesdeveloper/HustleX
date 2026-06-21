
const axios = require("axios");
require("dotenv").config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || "https://hustlex-production.up.railway.app/api/auth/telegram-webhook";

async function testBot() {
  try {
    console.log("🤖 Checking bot info...");
    const botInfo = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    console.log("✅ Bot info:", botInfo.data.result);

    // Step 1: Delete webhook temporarily
    console.log("\n🔌 Deleting webhook temporarily...");
    await axios.post(`https://api.telegram.org/bot${botToken}/deleteWebhook`);

    // Step 2: Get updates
    console.log("\n📥 Getting updates...");
    const updates = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates`);
    console.log("✅ Updates:", JSON.stringify(updates.data, null, 2));

    // Step 3: If there are updates, get your user ID
    if (updates.data.result && updates.data.result.length > 0) {
      const chatId = updates.data.result[updates.data.result.length - 1].message?.chat?.id;
      if (chatId) {
        console.log("\n👤 Found your chat ID:", chatId);

        // Step 4: Send a test message
        console.log("\n📤 Sending test message...");
        const testMsg = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: "🔧 This is a test message from HustleX bot! If you received this, the bot is working!"
        });
        console.log("✅ Test message sent:", testMsg.data);
      }
    }

    // Step 5: Set the webhook back
    console.log("\n🔌 Setting webhook back...");
    const webhookResult = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      url: webhookUrl
    });
    console.log("✅ Webhook set again:", webhookResult.data);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testBot();
