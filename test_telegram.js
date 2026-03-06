const axios = require("axios");
require("dotenv").config({ path: "c:/Users/Yohannes/OneDrive/Final year project/OneDrive/Desktop/HustleX/backend/.env" });

async function testTelegram() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log("Testing Telegram Posting...");
    console.log("Bot Token:", botToken ? "Set" : "Not Set");
    console.log("Chat ID:", chatId);

    if (!botToken || !chatId) {
        console.error("Missing credentials in .env");
        return;
    }

    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    try {
        const response = await axios.get(url);
        console.log("Bot info:", response.data);
    } catch (error) {
        console.error("Error getting bot info:", error.response ? error.response.data : error.message);
        return;
    }

    const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const sendResponse = await axios.post(sendUrl, {
            chat_id: chatId,
            text: "Test message from HustleX debug script",
        });
        console.log("Message sent successfully:", sendResponse.data);
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}

testTelegram();
