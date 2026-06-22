# 🔧 HustleX Telegram Bot - Fix & Setup Guide

## 🚨 Issue Summary

Your Telegram bot features are being blocked because:

1. **Token Exposure**: Bot tokens were exposed in public files (README and git repo)
2. **Token Revocation**: Telegram automatically revokes exposed tokens for security
3. **Bot Blocked**: Your previous bot @HustleXet_bot is no longer functional
4. **New Setup Required**: You need to create a new bot and configure it properly

---

## ✅ Step-by-Step Fix

### Step 1: Generate New Telegram Tokens

You need **2 separate bots**:
- **Profile Bot**: For profile setup wizard
- **Login Bot**: For Telegram login integration

**Create Profile Bot:**
1. Open Telegram and go to [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose a name (e.g., "HustleX Profile Bot")
4. Choose a username (e.g., "hustlex_profile_bot")
5. Copy the API token (format: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
6. Save it somewhere safe

**Create Login Bot:**
1. Repeat steps 2-5 with:
   - Name: "HustleX Login Bot"
   - Username: "hustlex_login_bot"
2. Copy this token as well

### Step 2: Configure Environment Variables

**Update `.env` (root directory):**
```env
# Telegram Profile Bot
TELEGRAM_PROFILE_BOT_TOKEN=your_profile_bot_token_from_step_1

# Optional if using shared token
TELEGRAM_BOT_TOKEN=your_profile_bot_token_from_step_1
```

**Update `backend/.env`:**
```env
# Telegram Login Bot (for auth integration)
TELEGRAM_BOT_TOKEN=your_login_bot_token_from_step_1
TELEGRAM_LOGIN_BOT_TOKEN=your_login_bot_token_from_step_1
```

### Step 3: Configure Bot Settings (Optional but Recommended)

Go back to [@BotFather](https://t.me/botfather) and run these commands:

**For Profile Bot:**
```
/setcommands

Select: @hustlex_profile_bot (or your username)

Then send:
start - Start the profile setup wizard
help - Display help information
profile - View your profile

/setdescription

Select: @hustlex_profile_bot

Then send:
🎯 Complete your HustleX freelancer profile in Telegram. Upload your picture, add education & certificates!
```

**For Login Bot:**
```
/setdescription

Select: @hustlex_login_bot

Then send:
🚀 Secure login to HustleX using Telegram authentication
```

### Step 4: Test the Profile Bot

**Open Telegram and search for your bot username or:**

```bash
# Start the Python bot
cd /path/to/Hustle\ X\ final
python telegram_profile_bot.py
```

You should see:
```
🤖 HustleX Telegram Bot is starting...
💼 HustleX - Connecting Talent with Opportunity
```

**In Telegram, send `/start` to your bot** and verify:
- ✅ Main menu appears
- ✅ Profile Setup button works
- ✅ Can upload photos
- ✅ Can enter education info
- ✅ Can enter certificates

### Step 5: Restart Backend Services

```bash
# Kill existing processes
cd backend
npm run dev

# Or if using Docker:
docker-compose restart
```

### Step 6: Verify Everything Works

1. **Test Profile Bot:**
   - Open [@HustleXet_bot](https://t.me/HustleXet_bot) or your new bot
   - Click `/start`
   - Go through profile setup
   - Should complete without errors

2. **Test Telegram Login (if integrated):**
   - Visit your HustleX web app
   - Try "Login with Telegram"
   - Should redirect to Telegram login flow

---

## 🔒 Security Best Practices Going Forward

### 1. Never Expose Tokens
- ✅ Store in `.env` files
- ✅ Add `.env` to `.gitignore`
- ❌ Don't put in README, comments, or public files
- ❌ Don't commit to git

### 2. Use Different Tokens for Different Environments
```env
# Development
TELEGRAM_BOT_TOKEN=dev_token_xxx

# Production
TELEGRAM_BOT_TOKEN=prod_token_yyy
```

### 3. Rotate Tokens Regularly
- If a token is ever exposed, regenerate it immediately
- Use `/revoke` in @BotFather to disable old tokens

### 4. Monitor Token Usage
- Watch for unexpected activity
- Check bot statistics in @BotFather

---

## 🆘 Troubleshooting

### Bot Still Blocked?
- **Solution**: Verify token is correct in `.env`
- Run: `echo $TELEGRAM_BOT_TOKEN` to check
- Regenerate if needed

### "Telegram bot token is required" Error
- **Check**: `.env` file has `TELEGRAM_PROFILE_BOT_TOKEN` or `TELEGRAM_BOT_TOKEN`
- **Verify**: No typos or extra spaces
- **Restart**: Python bot after updating `.env`

### Bot Not Responding to Commands
- **Check**: Bot is running (`ps aux | grep telegram`)
- **Verify**: Token is valid in @BotFather
- **Wait**: 5-10 minutes after creating bot for Telegram to activate

### Webhook Errors (if using production)
- Update `TELEGRAM_WEBHOOK_URL` to your server URL
- Ensure SSL certificate is valid
- Test with: `curl -X POST https://your-server.com/api/auth/telegram-webhook`

---

## 📋 Checklist

- [ ] Generated new Profile Bot token
- [ ] Generated new Login Bot token  
- [ ] Updated `.env` with tokens
- [ ] Updated `backend/.env` with tokens
- [ ] Ran `/setcommands` in @BotFather
- [ ] Started Python bot successfully
- [ ] Tested `/start` command in Telegram
- [ ] Profile setup wizard works end-to-end
- [ ] Backend services restarted

---

## 📞 Support

**Issues?** Check logs:
```bash
# Python bot logs
tail -f telegram_profile_bot.log

# Backend logs
cd backend && npm run dev
```

**Still blocked?** Contact:
- [@BotFather](https://t.me/botfather) - For bot administration
- Telegram Support - If account is restricted

---

💼 **HustleX** - Connecting Talent with Opportunity

**Last Updated**: 2026-06-22
**Status**: Ready for New Token Setup
