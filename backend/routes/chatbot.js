const express = require("express");
const router = express.Router();
const axios = require("axios");

// Chatbot route - supports multiple AI providers
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const COHERE_API_KEY = process.env.COHERE_API_KEY;
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    const SERPAPI_KEY = process.env.SERPAPI_KEY; // For web search
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY; // Alternative search API

    // Website context for the AI
    const systemPrompt = `You are HustleX Assistant, an intelligent AI chatbot for the HustleX freelancing platform. 

HustleX is a freelancing marketplace that connects talented freelancers with clients looking for professional services.

Key Information about HustleX:
- Platform Type: Freelancing marketplace
- Main Features: Job posting, freelancer discovery, real-time messaging, video calls, file sharing, secure payments
- User Roles: Freelancers and Clients
- How to Post Jobs: Navigate to "Post a Job", fill job details (title, description, budget, requirements), and submit
- How to Find Freelancers: Browse freelancer directory, use search filters, or post a job and review applications
- How to Sign Up: Click "Sign Up", choose role (Freelancer/Client), fill details, complete registration
- How to Apply: Browse jobs, click on a job, review details, click "Apply" button
- Contact: Available through Contact Us page, email, or support channels

You should:
- Answer questions about HustleX platform, features, and how to use it
- Be helpful, friendly, and professional
- Understand questions in different languages and syntax
- Provide accurate information about the platform
- Maintain conversation context from previous messages

IMPORTANT - Handling Unrelated Questions:
- If asked about topics completely unrelated to HustleX (e.g., weather, sports, general knowledge, other platforms), respond KINDLY and POLITELY
- Always acknowledge their question first, then gently redirect to HustleX
- Use phrases like: "I appreciate your question! While I'm specialized in helping with HustleX, I'd be happy to assist you with..."
- Never be dismissive or rude - always maintain a warm, helpful tone
- Offer to help with HustleX-related topics instead
- Example: "That's an interesting question! I'm HustleX Assistant, so I'm best at helping with questions about our freelancing platform. Is there anything about HustleX I can help you with today?"

Respond naturally and conversationally, always being kind and respectful.`;

    // Build conversation messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    let responseText = "";
    let error = null;
    let webSearchResults = null;

    // Check if web search is needed (for questions about current events, latest info, etc.)
    const needsWebSearch = checkIfNeedsWebSearch(message);
    
    if (needsWebSearch) {
      try {
        webSearchResults = await performWebSearch(message, SERPAPI_KEY, TAVILY_API_KEY);
        if (webSearchResults) {
          // Enhance system prompt with web search results
          systemPrompt += `\n\nRecent web search results related to the user's question:\n${webSearchResults}\n\nUse this information to provide accurate, up-to-date answers.`;
        }
      } catch (searchError) {
        console.error("Web search error:", searchError);
        // Continue without web search results
      }
    }

    // Try OpenAI first (most powerful)
    if (OPENAI_API_KEY) {
      try {
        const openaiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini", // Using cost-effective model, can upgrade to gpt-4
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        responseText = openaiResponse.data.choices[0].message.content;
      } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError.response?.data || openaiError.message);
        error = "OpenAI";
      }
    }

    // Fallback to Anthropic Claude
    if (!responseText && ANTHROPIC_API_KEY) {
      try {
        const claudeResponse = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: "claude-3-haiku-20240307",
            max_tokens: 1000,
            messages: messages.filter((m) => m.role !== "system"),
            system: systemPrompt,
          },
          {
            headers: {
              "x-api-key": ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        responseText = claudeResponse.data.content[0].text;
      } catch (claudeError) {
        console.error("Anthropic API Error:", claudeError.response?.data || claudeError.message);
        if (!error) error = "Anthropic";
      }
    }

    // Fallback to Cohere
    if (!responseText && COHERE_API_KEY) {
      try {
        const conversationContext = conversationHistory
          .slice(-5)
          .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
          .join("\n");

        const cohereResponse = await axios.post(
          "https://api.cohere.ai/v1/chat",
          {
            message: message,
            chat_history: conversationHistory.slice(-10).map((msg) => ({
              role: msg.sender === "user" ? "USER" : "CHATBOT",
              message: msg.text,
            })),
            preamble: systemPrompt,
            model: "command-r-plus",
          },
          {
            headers: {
              Authorization: `Bearer ${COHERE_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        responseText = cohereResponse.data.text;
      } catch (cohereError) {
        console.error("Cohere API Error:", cohereError.response?.data || cohereError.message);
        if (!error) error = "Cohere";
      }
    }

    // Fallback to Hugging Face (free tier available)
    if (!responseText && HUGGINGFACE_API_KEY) {
      try {
        const hfResponse = await axios.post(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
          {
            inputs: {
              past_user_inputs: conversationHistory
                .filter((m) => m.sender === "user")
                .slice(-5)
                .map((m) => m.text),
              generated_responses: conversationHistory
                .filter((m) => m.sender === "bot")
                .slice(-5)
                .map((m) => m.text),
              text: message,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            },
            timeout: 30000,
          }
        );

        responseText = hfResponse.data.generated_text || hfResponse.data[0]?.generated_text;
      } catch (hfError) {
        console.error("Hugging Face API Error:", hfError.response?.data || hfError.message);
        if (!error) error = "HuggingFace";
      }
    }

    // Ultimate fallback - intelligent rule-based response
    if (!responseText) {
      responseText = generateIntelligentResponse(message, conversationHistory, systemPrompt);
    }

    res.json({
      response: responseText,
      provider: responseText ? (OPENAI_API_KEY ? "OpenAI" : ANTHROPIC_API_KEY ? "Anthropic" : COHERE_API_KEY ? "Cohere" : HUGGINGFACE_API_KEY ? "HuggingFace" : "Rule-Based") : "Error",
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error.message,
    });
  }
});

// Check if question needs web search
function checkIfNeedsWebSearch(message) {
  const normalized = message.toLowerCase();
  const webSearchKeywords = [
    "latest", "recent", "current", "today", "now", "news", "update", "trending",
    "what happened", "when did", "who is", "where is", "how much", "price of",
    "compare", "best", "top", "review", "opinion", "thoughts on"
  ];
  return webSearchKeywords.some(keyword => normalized.includes(keyword));
}

// Perform web search using available APIs
async function performWebSearch(query, serpApiKey, tavilyApiKey) {
  // Try Tavily API first (better for AI applications)
  if (tavilyApiKey) {
    try {
      const tavilyResponse = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyApiKey,
          query: query,
          search_depth: "basic",
          include_answer: true,
          include_raw_content: false,
          max_results: 3,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (tavilyResponse.data && tavilyResponse.data.results) {
        const results = tavilyResponse.data.results.map((r, i) => 
          `[${i + 1}] ${r.title}: ${r.content}`
        ).join("\n\n");
        
        if (tavilyResponse.data.answer) {
          return `Answer: ${tavilyResponse.data.answer}\n\nSources:\n${results}`;
        }
        return results;
      }
    } catch (tavilyError) {
      console.error("Tavily API Error:", tavilyError.message);
    }
  }

  // Fallback to SerpAPI
  if (serpApiKey) {
    try {
      const serpResponse = await axios.get(
        "https://serpapi.com/search",
        {
          params: {
            api_key: serpApiKey,
            q: query,
            engine: "google",
            num: 3,
          },
          timeout: 10000,
        }
      );

      if (serpResponse.data && serpResponse.data.organic_results) {
        const results = serpResponse.data.organic_results
          .slice(0, 3)
          .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}`)
          .join("\n\n");
        return results;
      }
    } catch (serpError) {
      console.error("SerpAPI Error:", serpError.message);
    }
  }

  // Fallback to DuckDuckGo (free, no API key needed)
  try {
    const ddgResponse = await axios.get(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      {
        timeout: 10000,
      }
    );

    if (ddgResponse.data && ddgResponse.data.RelatedTopics) {
      const results = ddgResponse.data.RelatedTopics
        .slice(0, 3)
        .map((topic, i) => {
          if (topic.Text) {
            return `[${i + 1}] ${topic.Text}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n\n");
      
      if (results) return results;
    }

    if (ddgResponse.data && ddgResponse.data.AbstractText) {
      return `Summary: ${ddgResponse.data.AbstractText}`;
    }
  } catch (ddgError) {
    console.error("DuckDuckGo API Error:", ddgError.message);
  }

  return null;
}

// Intelligent fallback function
function generateIntelligentResponse(message, conversationHistory, systemPrompt) {
  const normalized = message.toLowerCase().trim();
  
  // Enhanced knowledge base with semantic understanding
  const knowledgeBase = {
    platform: [
      "HustleX is a freelancing platform that connects talented freelancers with clients. It offers job posting, freelancer discovery, messaging, video calls, and secure payments.",
      "HustleX is a marketplace where freelancers showcase skills and clients find talent. Features include job management, real-time communication, and profile customization.",
    ],
    job: [
      "To post a job: Go to 'Post a Job', enter job title, description, budget, requirements, and submit. Your job will be visible to freelancers who can apply.",
      "Posting jobs is easy: Navigate to Post Job page, fill in details about what you need, set budget and timeline, then publish. Freelancers will see and apply.",
    ],
    freelancer: [
      "Find freelancers by browsing the directory, using search filters (skills, experience, location), or posting a job and reviewing applications from interested professionals.",
      "Discover freelancers through our search feature with filters, browse profiles, or post a job and receive applications from qualified candidates.",
    ],
    signup: [
      "Sign up by clicking 'Sign Up', choose your role (Freelancer or Client), provide your email and details, and complete registration to start using HustleX.",
      "Registration is simple: Click Sign Up, select Freelancer or Client role, enter your information, verify your email, and you're ready to go!",
    ],
    apply: [
      "Apply for jobs by browsing listings, clicking on a job that interests you, reviewing requirements, and clicking the 'Apply' button with your portfolio and cover letter.",
      "To apply: Find a job matching your skills, read the details, prepare your application materials, and submit through the job details page.",
    ],
    feature: [
      "HustleX features include: job posting and management, freelancer search with filters, real-time messaging, video calls, file attachments, application tracking, secure payments, and comprehensive profiles.",
      "Key features: Job marketplace, freelancer directory, instant messaging, video communication, file sharing, application system, payment processing, and profile management.",
    ],
    price: [
      "HustleX offers flexible pricing. Contact us or visit our pricing page for detailed information about subscription plans and transaction fees.",
      "Pricing varies based on your needs. Check our pricing section or contact support for information about costs and payment options.",
    ],
    contact: [
      "Contact us through the Contact Us page, email support, or use our help center. We're here to assist you with any questions!",
      "Reach out via Contact Us section, email, or support channels. Our team is available to help you succeed on HustleX.",
    ],
  };

  // Semantic matching with context
  const patterns = [
    { keywords: ["what", "tell me", "explain", "about", "info"], topic: "platform" },
    { keywords: ["post", "create", "add", "list", "job"], topic: "job" },
    { keywords: ["find", "search", "browse", "discover", "freelancer", "talent"], topic: "freelancer" },
    { keywords: ["sign up", "register", "join", "account", "signup"], topic: "signup" },
    { keywords: ["apply", "application", "bid", "proposal"], topic: "apply" },
    { keywords: ["feature", "what can", "capability", "offer"], topic: "feature" },
    { keywords: ["price", "cost", "fee", "pay", "pricing"], topic: "price" },
    { keywords: ["contact", "support", "help", "reach", "email"], topic: "contact" },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => normalized.includes(kw))) {
      const answers = knowledgeBase[pattern.topic];
      if (answers) {
        return answers[Math.floor(Math.random() * answers.length)];
      }
    }
  }

  // Context-aware response
  if (conversationHistory.length > 0) {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage.sender === "bot" && (normalized.includes("yes") || normalized.includes("ok") || normalized.includes("thanks"))) {
      return "Great! Is there anything else I can help you with about HustleX?";
    }
  }

  // Greeting detection
  if (normalized.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i)) {
    return "Hello! 👋 Welcome to HustleX! I'm here to help you learn about our platform. You can ask me about posting jobs, finding freelancers, signing up, features, or anything else about HustleX. What would you like to know?";
  }

  // Thank you detection
  if (normalized.match(/(thank|thanks|appreciate|grateful)/i)) {
    return "You're welcome! 😊 Feel free to ask if you need any more help with HustleX!";
  }

  // Detect unrelated topics and respond kindly
  const unrelatedKeywords = [
    "weather", "temperature", "rain", "snow", "forecast", "climate",
    "sports", "football", "basketball", "soccer", "cricket", "tennis", "game", "match", "score",
    "recipe", "cooking", "food", "restaurant", "recipe",
    "movie", "film", "actor", "celebrity", "entertainment",
    "news", "politics", "election", "government", "president",
    "science", "physics", "chemistry", "biology", "mathematics", "math",
    "history", "war", "ancient", "historical",
    "travel", "vacation", "hotel", "flight", "tourism",
    "health", "medicine", "doctor", "hospital", "disease", "symptoms",
    "stock", "market", "crypto", "bitcoin", "investment", "trading",
    "other platform", "upwork", "fiverr", "competitor",
  ];

  const isUnrelated = unrelatedKeywords.some(keyword => normalized.includes(keyword));
  
  // Check if question is clearly unrelated to HustleX
  const hustlexKeywords = ["hustlex", "freelance", "freelancer", "job", "client", "platform", "marketplace", "apply", "post", "hire"];
  const hasHustlexContext = hustlexKeywords.some(keyword => normalized.includes(keyword));

  if (isUnrelated && !hasHustlexContext) {
    // Kind response for unrelated questions
    const kindResponses = [
      `I appreciate your question! 😊 I'm HustleX Assistant, specialized in helping with our freelancing platform. While I'd love to chat about that, I'm best at answering questions about HustleX - like how to post jobs, find freelancers, or get started on our platform. Is there anything about HustleX I can help you with today?`,
      `That's an interesting topic! While I'm here specifically to help with HustleX, I'd be happy to assist you with questions about our platform. You can ask me about posting jobs, finding talented freelancers, signing up, or any other HustleX features. What would you like to know? 😊`,
      `Thanks for your question! I'm HustleX Assistant, so I'm optimized to help with our freelancing platform. I'd be delighted to help you with anything related to HustleX - from job posting to freelancer discovery. How can I assist you with HustleX today? 🤖`,
    ];
    return kindResponses[Math.floor(Math.random() * kindResponses.length)];
  }

  // Default intelligent response
  return `I understand you're asking about "${message}". While I'm optimized to help with HustleX platform questions, I can assist you with:

• **Platform Information**: What HustleX is and how it works
• **Job Posting**: How to create and manage job listings
• **Finding Freelancers**: Discover and connect with talent
• **Getting Started**: Sign up and account setup
• **Applications**: How to apply for jobs as a freelancer
• **Features**: Explore platform capabilities
• **Support**: Contact and help information

Could you rephrase your question or ask about one of these topics? I'm here to help! 🤖`;
}

module.exports = router;
