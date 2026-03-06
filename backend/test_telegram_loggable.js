const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const logFile = path.join(__dirname, "test_telegram_log.txt");

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, line);
}

async function testTelegram() {
    fs.writeFileSync(logFile, "Starting test...\n");
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    log("Testing Telegram Posting...");
    log(`Bot Token: ${botToken ? "Set" : "Not Set"}`);
    log(`Chat ID: ${chatId}`);

    if (!botToken || !chatId) {
        log("Missing credentials in .env");
        return;
    }

    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    try {
        const response = await axios.get(url);
        log(`Bot info: ${JSON.stringify(response.data)}`);
    } catch (error) {
        log(`Error getting bot info: ${JSON.stringify(error.response ? error.response.data : error.message)}`);
        return;
    }

    const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const sendResponse = await axios.post(sendUrl, {
            chat_id: chatId,
            text: "Test message from HustleX debug script at " + new Date().toISOString(),
        });
        log(`Message sent successfully: ${JSON.stringify(sendResponse.data)}`);
    } catch (error) {
        log(`Error sending message: ${JSON.stringify(error.response ? error.response.data : error.message)}`);
    }
}

testTelegram().catch(err => log(`FATAL ERROR: ${err.message}\n${err.stack}`));
