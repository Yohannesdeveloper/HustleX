const axios = require("axios");
require("dotenv").config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function testBot() {
  try {
    console.log("🔍 Getting bot info...");
    const botInfo = await axios.get(
      `https://api.telegram.org/bot${botToken}/getMe`
    );
    console.log("✅ Bot info:", botInfo.data.result);

    console.log("\n🔍 Getting updates...");
    const updates = await axios.get(
      `https://api.telegram.org/bot${botToken}/getUpdates`
    );
    console.log("✅ Updates received:", JSON.stringify(updates.data, null, 2));
  } catch (error) {
    console.error("❌ Error testing bot:", error.response?.data || error.message);
  }
}

testBot();
