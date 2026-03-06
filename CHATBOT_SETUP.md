# 🤖 HustleX AI Chatbot Setup Guide

## Overview

The HustleX chatbot is a powerful AI assistant powered by multiple AI providers with web search capabilities. It can understand questions in different languages, syntax, and semantics, providing intelligent responses about the HustleX platform.

## Features

- ✅ **Multi-Provider AI Support**: OpenAI GPT-4, Anthropic Claude, Cohere, Hugging Face
- ✅ **Web Search Integration**: Real-time web search for current information
- ✅ **Conversation Context**: Maintains conversation history for context-aware responses
- ✅ **Multi-Language Support**: Understands questions in various languages and syntax
- ✅ **Intelligent Fallback**: Rule-based responses when APIs are unavailable
- ✅ **Error Handling**: Graceful degradation with fallback responses

## Quick Start

### 1. Install Dependencies

The backend already includes `axios`. If you need to reinstall:

```bash
cd backend
npm install axios
```

### 2. Configure API Keys

Add your API keys to `backend/.env`:

```env
# AI Provider API Keys (at least one required for best experience)
OPENAI_API_KEY=sk-your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
# OR
COHERE_API_KEY=your-cohere-api-key-here
# OR
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Web Search API Keys (optional but recommended)
SERPAPI_KEY=your-serpapi-key-here
TAVILY_API_KEY=tvly-your-tavily-api-key-here
```

### 3. Get API Keys

#### OpenAI (Recommended - Most Powerful)
1. Go to https://platform.openai.com/api-keys
2. Sign up/login
3. Create a new API key
4. Add credits to your account ($5 minimum)
5. **Cost**: ~$0.15 per 1M tokens (very affordable)

#### Anthropic Claude (Alternative)
1. Go to https://console.anthropic.com/
2. Sign up/login
3. Create API key
4. **Cost**: Pay-as-you-go

#### Cohere (Alternative)
1. Go to https://dashboard.cohere.com/
2. Sign up/login
3. Get API key from dashboard
4. **Cost**: Free tier available

#### Hugging Face (Free Option)
1. Go to https://huggingface.co/settings/tokens
2. Create account/login
3. Generate access token
4. **Cost**: Free tier available

#### Web Search APIs (Optional)

**Tavily API** (Recommended for AI):
1. Go to https://tavily.com/
2. Sign up for free account
3. Get API key
4. **Cost**: Free tier: 1,000 searches/month

**SerpAPI** (Alternative):
1. Go to https://serpapi.com/
2. Sign up for free account
3. Get API key
4. **Cost**: Free tier: 100 searches/month

**DuckDuckGo** (Free, no API key):
- Already integrated, no setup needed
- Limited results but works without API key

### 4. Start the Server

```bash
cd backend
npm run dev
```

The chatbot API will be available at: `http://localhost:5000/api/chatbot/chat`

## API Usage

### Endpoint

```
POST /api/chatbot/chat
```

### Request Body

```json
{
  "message": "How do I post a job on HustleX?",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Hello"
    },
    {
      "sender": "bot",
      "text": "Hello! How can I help you?"
    }
  ]
}
```

### Response

```json
{
  "response": "To post a job on HustleX, navigate to 'Post a Job'...",
  "provider": "OpenAI"
}
```

## How It Works

1. **User sends message** → Frontend calls `/api/chatbot/chat`
2. **Web Search Check** → If question needs current info, performs web search
3. **AI Provider Selection** → Tries providers in order:
   - OpenAI (if available)
   - Anthropic Claude (if OpenAI fails)
   - Cohere (if previous fail)
   - Hugging Face (if previous fail)
   - Rule-based fallback (always works)
4. **Response Generation** → AI generates context-aware response
5. **Return to User** → Response sent back to frontend

## Provider Priority

The chatbot automatically selects the best available provider:

1. **OpenAI GPT-4o-mini** (Best balance of cost and quality)
2. **Anthropic Claude 3 Haiku** (Fast and efficient)
3. **Cohere Command R+** (Good for long conversations)
4. **Hugging Face DialoGPT** (Free option)
5. **Rule-Based Fallback** (Always works, no API needed)

## Web Search Integration

The chatbot automatically detects when web search is needed:

- Questions about "latest", "recent", "current" events
- Price comparisons
- Reviews and opinions
- Current news
- Real-time information

Web search results are included in the AI's context to provide accurate, up-to-date answers.

## Cost Optimization

### Free Tier Setup (No Credit Card Required)

1. **Hugging Face** (Free) - Basic AI responses
2. **DuckDuckGo** (Free) - Web search
3. **Rule-based fallback** - Always works

### Budget Setup (~$5/month)

1. **OpenAI** - $5 credit (lasts ~30,000 messages)
2. **Tavily** - Free tier (1,000 searches/month)

### Premium Setup (Best Experience)

1. **OpenAI GPT-4o-mini** - Best quality
2. **Tavily API** - Best search results

## Troubleshooting

### Chatbot not responding

1. Check if backend server is running: `http://localhost:5000/api/health`
2. Check API keys in `backend/.env`
3. Check browser console for errors
4. Check backend logs for API errors

### API Rate Limits

- If you hit rate limits, the chatbot automatically falls back to the next provider
- Add more API keys to increase capacity
- Use free tiers for development

### Web Search Not Working

- Web search is optional - chatbot works without it
- Check if API keys are set correctly
- DuckDuckGo works without API key (limited results)

## Advanced Configuration

### Change AI Model

Edit `backend/routes/chatbot.js`:

```javascript
// For OpenAI
model: "gpt-4o-mini", // Change to "gpt-4" for better quality (more expensive)

// For Anthropic
model: "claude-3-haiku-20240307", // Change to "claude-3-opus-20240229" for best quality
```

### Adjust Response Length

```javascript
max_tokens: 1000, // Increase for longer responses
```

### Customize System Prompt

Edit the `systemPrompt` variable in `backend/routes/chatbot.js` to customize the chatbot's personality and knowledge.

## Security Notes

- ⚠️ **Never commit `.env` file** - It contains sensitive API keys
- ⚠️ **Use environment variables** - Don't hardcode API keys
- ⚠️ **Rotate API keys** - Change keys if compromised
- ⚠️ **Monitor usage** - Check API dashboards for unexpected usage

## Support

If you encounter issues:

1. Check the backend logs
2. Verify API keys are correct
3. Test API endpoints directly
4. Check provider status pages:
   - OpenAI: https://status.openai.com/
   - Anthropic: https://status.anthropic.com/

## Example Questions

The chatbot can answer:

- "What is HustleX?"
- "How do I post a job?"
- "Tell me about freelancer features"
- "What's the latest news about freelancing?"
- "Compare HustleX with Upwork"
- "How much does it cost?"
- "¿Qué es HustleX?" (Spanish)
- "HustleXとは何ですか?" (Japanese)
- And many more in different languages and syntax!

---

**Made with ❤️ for HustleX**
