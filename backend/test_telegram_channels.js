const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const logFile = path.join(__dirname, "test_telegram_channels.txt");

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, line);
}

async function testChannels() {
    fs.writeFileSync(logFile, "Starting channel test...\n");
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channels = ["@HustleXeth", "@HustleXet"];

    log(`Bot Token: ${botToken ? "Set" : "Not Set"}`);

    for (const channel of channels) {
        log(`Testing channel: ${channel}`);
        const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        try {
            const sendResponse = await axios.post(sendUrl, {
                chat_id: channel,
                text: `Test message for ${channel} from debug script`,
            });
            log(`SUCCESS for ${channel}: ${JSON.stringify(sendResponse.data)}`);
        } catch (error) {
            log(`FAILURE for ${channel}: ${JSON.stringify(error.response ? error.response.data : error.message)}`);
        }
    }
}

testChannels();
