# 🚀 Quick Start: Powerful AI Chatbot

## ⚡ 5-Minute Setup

### Step 1: Add API Key (Choose ONE)

Open `backend/.env` and add:

```env
# Option 1: OpenAI (Recommended - Best Quality)
OPENAI_API_KEY=sk-your-key-here

# Option 2: Free Option - Hugging Face
HUGGINGFACE_API_KEY=your-token-here

# Optional: Web Search (Free)
TAVILY_API_KEY=tvly-your-key-here
```

### Step 2: Get Free API Keys

**OpenAI** (Best - $5 credit = ~30,000 messages):
1. Visit: https://platform.openai.com/api-keys
2. Sign up → Create API key → Add $5 credit
3. Copy key to `.env`

**Hugging Face** (Free - No credit card):
1. Visit: https://huggingface.co/settings/tokens
2. Sign up → Create token
3. Copy token to `.env`

**Tavily** (Free - Web Search):
1. Visit: https://tavily.com/
2. Sign up → Get API key
3. Copy key to `.env`

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

### Step 4: Test It!

Open your app and click the chat icon in the bottom right. Ask:
- "What is HustleX?"
- "How do I post a job?"
- "Tell me about freelancing"

## 🎯 That's It!

The chatbot now:
- ✅ Understands all languages and syntax
- ✅ Uses ChatGPT-level AI (if OpenAI key added)
- ✅ Has web search capabilities
- ✅ Maintains conversation context
- ✅ Works even without API keys (fallback mode)

## 💡 Pro Tips

1. **No API Key?** It still works with intelligent fallback!
2. **Want better responses?** Add OpenAI API key
3. **Need web search?** Add Tavily API key
4. **Multiple keys?** It automatically uses the best available

## 📚 Full Documentation

See `CHATBOT_SETUP.md` for complete setup guide.

---

**Ready to impress! 🎉**
