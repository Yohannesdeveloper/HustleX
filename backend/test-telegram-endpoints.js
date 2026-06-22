const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const serverUrl = "http://localhost:5000/api/auth";

async function testTelegramLoginFlow() {
  console.log("🚀 Starting Telegram Login Integration Test...");
  console.log("Bot Token:", botToken ? "Set" : "Not Set");

  if (!botToken) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not configured in .env");
    return;
  }

  // 1. Create a dummy Telegram login payload using the actual Chat ID
  const telegramData = {
    id: parseInt(process.env.TELEGRAM_CHAT_ID) || 123456789,
    first_name: "Test",
    last_name: "User",
    username: "test_hustlex_user",
    photo_url: "https://example.com/avatar.jpg",
    auth_date: Math.floor(Date.now() / 1000),
  };

  // 2. Sign the data to make it valid for the hash check
  const dataToCheck = { ...telegramData };
  const sortedKeys = Object.keys(dataToCheck).sort();
  const dataCheckString = sortedKeys
    .map((key) => `${key}=${dataToCheck[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(dataCheckString);
  const hash = hmac.digest("hex");
  
  telegramData.hash = hash;

  try {
    // 3. Send the login request
    console.log("📤 Sending POST /telegram-login...");
    const loginRes = await axios.post(`${serverUrl}/telegram-login`, {
      telegramData,
    });

    console.log("📥 Response status:", loginRes.status);
    console.log("📥 Response data:", loginRes.data);

    const { loginRequestId, status } = loginRes.data;

    if (!loginRequestId) {
      console.log("✅ Logged in immediately (fallback mode triggered or already verified).");
      return;
    }

    console.log(`✅ Pending login request created successfully! Request ID: ${loginRequestId}`);

    // 4. Poll status to verify getPendingEntry works
    console.log(`🔍 Checking status for request ID ${loginRequestId}...`);
    const statusRes = await axios.get(`${serverUrl}/telegram-login-status/${loginRequestId}`);
    console.log("📥 Status check response:", statusRes.data);

    if (statusRes.data.status === "pending") {
      console.log("✅ Status is 'pending' as expected.");
    } else {
      console.error("❌ Unexpected status:", statusRes.data.status);
    }

    // 5. Test webhook simulation (confirm the login)
    console.log("📤 Simulating webhook confirmation callback...");
    // Callback queries from Telegram are POSTed to /telegram-webhook
    // The format matches Telegram Bot API webhook updates
    const webhookPayload = {
      callback_query: {
        id: "mock_callback_id_123",
        from: { id: telegramData.id },
        data: `tglogin_confirm_${loginRequestId}`,
        message: {
          message_id: 9999,
          chat: { id: telegramData.id }
        }
      }
    };

    const webhookRes = await axios.post(`${serverUrl}/telegram-webhook`, webhookPayload);
    console.log("📥 Webhook response status:", webhookRes.status);

    // Give the backend a moment to process the webhook asynchronously
    console.log("⏳ Waiting 500ms for backend processing...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 6. Check status again to verify it has changed to "confirmed" and retrieves user payload
    console.log("🔍 Checking status again after webhook confirmation...");
    const finalStatusRes = await axios.get(`${serverUrl}/telegram-login-status/${loginRequestId}`);
    console.log("📥 Final status check response:", finalStatusRes.data);

    if (finalStatusRes.data.status === "confirmed" && finalStatusRes.data.token) {
      console.log("🎉 SUCCESS: Telegram login flow completed and verified end-to-end!");
    } else {
      console.error("❌ FAILED: Final status is not 'confirmed' or token is missing.");
    }

  } catch (error) {
    console.error("❌ Error in login integration test:", error.response?.data || error.message);
  }
}

// Give the server a second to ensure it is listening
setTimeout(testTelegramLoginFlow, 1000);
