const express = require("express");
const router = express.Router();
const axios = require("axios");

// Chatbot route - supports multiple AI providers
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], language } = req.body;

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
    let systemPrompt = `You are HustleX Assistant, an intelligent AI chatbot for the HustleX freelancing platform. 

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

LANGUAGE SUPPORT RULES:
- HustleX is a multilingual platform supporting English (en), Amharic (አማርኛ - am), Afan Oromo (Afaan Oromoo - om), and Tigrinya (ትግርኛ - ti).
- You MUST recognize the language of the user's message (even if the user changes language mid-conversation) or use the preferred language '${language || "en"}' passed from the UI.
- Respond in the same language as the user's message (e.g., if the user asks in Amharic, respond in Amharic; if in Afan Oromo, respond in Afan Oromo; if in Tigrinya, respond in Tigrinya).
- Use proper vocabulary and syntax for local Ethiopian languages:
  * Amharic: Use "HustleX" or "ሃስልኤክስ", "ነጻ ሰራተኛ" (Freelancer), "ቀጣሪ/ደንበኛ" (Client), "ስራ መለጠፍ" (Post Job), "ለስራ ማመልከት" (Apply for Job).
  * Afan Oromo: Use "HustleX", "hojjataa bilisaa" (Freelancer), "daldala/koontрат" (Client), "hojii baasuu/post gochuu" (Post Job), "hojiif iyyachuu" (Apply for Job).
  * Tigrinya: Use "HustleX", "ነጻ ሰራሕተኛ" (Freelancer), "ዓሚል" (Client), "ስራሕ ምልጣፍ" (Post Job), "ንስራሕ ምምልካት" (Apply for Job).

IMPORTANT - Handling Unrelated Questions:
- If asked about topics completely unrelated to HustleX (e.g., weather, sports, general knowledge, other platforms), respond KINDLY and POLITELY in the user's language.
- Always acknowledge their question first, then gently redirect to HustleX.
- Offer to help with HustleX-related topics instead.

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
      responseText = generateIntelligentResponse(message, conversationHistory, systemPrompt, language);
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

// Detect language of the query or use preferred language from frontend
function detectLanguage(message, preferredLanguage) {
  let detected = "en";
  if (preferredLanguage && ["en", "am", "om", "ti"].includes(preferredLanguage)) {
    detected = preferredLanguage;
  }

  const normalized = message.toLowerCase();

  // 1. Detect Ethiopic (Ge'ez) script - used by Amharic and Tigrinya
  const hasEthiopic = /[\u1200-\u137F]/.test(message);
  if (hasEthiopic) {
    // Tigrinya specific letters: ቐ ቑ ቒ ቓ ቔ ቖ ኸ ኹ ኺ ኻ ኼ ኾ ዧ ጘ ጙ ጚ ጛ ጜ ጝ ጞ ጟ
    const tigrinyaPattern = /[ቐቑቒቓቔቖኸኹኺኻኼኾዧጘጙጚጛጜጝጞጟ]/;
    if (tigrinyaPattern.test(message)) {
      return "ti";
    }
    // Also check for common Tigrinya words/particles
    const tigrinyaWords = ["እንድዒ", "ቀይሕ", "ጽቡቕ", "መጺአ", "የቀንየለይ", "እንታይ", "ከመይ", "ስራሕ", "ዓሚል", "ምልጣፍ"];
    if (tigrinyaWords.some(w => message.includes(w))) {
      return "ti";
    }

    // Amharic common words/particles
    const amharicWords = ["አመሰግናለሁ", "ምንድን", "ነው", "እንዴት", "ነጻ", "ሰራተኛ", "መምረጥ", "ለመለጠፍ", "ደንበኛ"];
    if (amharicWords.some(w => message.includes(w))) {
      return "am";
    }

    // Tie-breaker: if preferredLanguage was am or ti, keep it. Otherwise default to am.
    if (detected === "am" || detected === "ti") {
      return detected;
    }
    return "am";
  }

  // 2. Detect Oromifa (Afaan Oromoo) - Latin script, check for distinct keywords
  const oromoKeywords = [
    "akkam", "gaaffii", "hojii", "galatoomaa", "keenya", "bilisaa", 
    "daldala", "deebisi", "iyya", "plaatformii", "tajaajila", "fi", "keenyan",
    "galmee", "qunnam", "baga", "nagaan", "dhuftan", "ani", "gargaaraa", "koontrat"
  ];
  const words = normalized.split(/[^a-zA-Z']/);
  const oromoWordCount = words.filter(w => oromoKeywords.includes(w)).length;
  if (oromoWordCount >= 1) {
    return "om";
  }

  return detected;
}

// Intelligent fallback function
function generateIntelligentResponse(message, conversationHistory, systemPrompt, preferredLanguage) {
  const normalized = message.toLowerCase().trim();
  const language = detectLanguage(message, preferredLanguage);

  // Enhanced multilingual knowledge base
  const knowledgeBase = {
    en: {
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
      patterns: [
        { keywords: ["what", "tell me", "explain", "about", "info"], topic: "platform" },
        { keywords: ["post", "create", "add", "list", "job"], topic: "job" },
        { keywords: ["find", "search", "browse", "discover", "freelancer", "talent"], topic: "freelancer" },
        { keywords: ["sign up", "register", "join", "account", "signup"], topic: "signup" },
        { keywords: ["apply", "application", "bid", "proposal"], topic: "apply" },
        { keywords: ["feature", "what can", "capability", "offer"], topic: "feature" },
        { keywords: ["price", "cost", "fee", "pay", "pricing"], topic: "price" },
        { keywords: ["contact", "support", "help", "reach", "email"], topic: "contact" },
      ],
      thankYou: "You're welcome! 😊 Feel free to ask if you need any more help with HustleX!",
      greeting: "Hello! 👋 Welcome to HustleX! I'm here to help you learn about our platform. You can ask me about posting jobs, finding freelancers, signing up, features, or anything else about HustleX. What would you like to know?",
      unrelated: [
        `I appreciate your question! 😊 I'm HustleX Assistant, specialized in helping with our freelancing platform. While I'd love to chat about that, I'm best at answering questions about HustleX - like how to post jobs, find freelancers, or get started on our platform. Is there anything about HustleX I can help you with today?`,
        `That's an interesting topic! While I'm here specifically to help with HustleX, I'd be happy to assist you with questions about our platform. You can ask me about posting jobs, finding talented freelancers, signing up, or any other HustleX features. What would you like to know? 😊`,
        `Thanks for your question! I'm HustleX Assistant, so I'm optimized to help with our freelancing platform. I'd be delighted to help you with anything related to HustleX - from job posting to freelancer discovery. How can I assist you with HustleX today? 🤖`,
      ],
      default: `I understand you're asking about "${message}". While I'm optimized to help with HustleX platform questions, I can assist you with:\n\n• **Platform Information**: What HustleX is and how it works\n• **Job Posting**: How to create and manage job listings\n• **Finding Freelancers**: Discover and connect with talent\n• **Getting Started**: Sign up and account setup\n• **Applications**: How to apply for jobs as a freelancer\n• **Features**: Explore platform capabilities\n• **Support**: Contact and help information\n\nCould you rephrase your question or ask about one of these topics? I'm here to help! 🤖`
    },
    am: {
      platform: [
        "HustleX ታላላቅ የኢትዮጵያ ነጻ ሰራተኞችን (freelancers) ከደንበኞች ጋር የሚያገናኝ መድረክ ነው። ስራ መለጠፍ፣ ሰራተኛ መፈለግ፣ መልእክት መላክ፣ የቪዲዮ ጥሪ እና ደህንነቱ የተጠበቀ ክፍያ ያካተተ ነው።",
        "HustleX ነጻ ሰራተኞች ክህሎታቸውን የሚያሳዩበት እና ደንበኞች ደግሞ ባለሙያዎችን የሚያገኙበት የገበያ ቦታ ነው። ስራ ማስተዳደር፣ የቀጥታ ግንኙነት እና የፕሮፋይል ማበልጸጊያዎችን ያካትታል።",
      ],
      job: [
        "ስራ ለመለጠፍ፡ ወደ 'ስራ ለጥፍ' (Post a Job) ገጽ በመሄድ፣ የስራውን ርዕስ፣ መግለጫ፣ በጀት እና መስፈርቶችን በመሙላት ይለጥፉ። ስራው ለነጻ ሰራተኞች የሚታይ ሲሆን ማመልከት ይችላሉ።",
        "ስራ መለጠፍ ቀላል ነው፡ 'ስራ ለጥፍ' የሚለውን ይጫኑ፣ የሚፈልጉትን ስራ ዝርዝር ያስገቡ፣ በጀት እና የጊዜ ገደብ ይወስኑ፣ ከዚያም ያትሙት። ሰራተኞች አይተው ያመለክታሉ።",
      ],
      freelancer: [
        "ነጻ ሰራተኞችን ለማግኘት፡ የሰራተኞችን ዝርዝር በመመልከት፣ ማጣሪያዎችን (ክህሎት፣ ልምድ፣ የስራ ቦታ) በመጠቀም ወይም ስራ በመለጠፍ እና የመጡ ማመልከቻዎችን በመገምገም ማግኘት ይችላሉ።",
        "ሰራተኞችን በእኛ የፍለጋ መፈለጊያ በኩል ማጣሪያዎችን በመጠቀም ማግኘት፣ ፕሮፋይላቸውን መጎብኘት ወይም ስራ ለጥፈው ማመልከቻዎችን መቀበል ይችላሉ።",
      ],
      signup: [
        "ለመመዝገብ፡ 'ተመዝገብ' (Sign Up) የሚለውን ይጫኑ፣ ሚናዎን ይምረጡ (ነጻ ሰራተኛ ወይስ ደንበኛ)፣ ኢሜይል እና አስፈላጊ መረጃዎችን ያስገቡ፣ ከዚያም ምዝገባውን ያጠናቅቁ።",
        "ምዝገባ በጣም ቀላል ነው፡ 'ተመዝገብ' የሚለውን ይጫኑ፣ እንደ ፍሪላንሰር ወይም ቀጣሪ አካውንት ይክፈቱ፣ መረጃዎን ይሙሉ እና ኢሜይልዎን ያረጋግጡ።",
      ],
      apply: [
        "ለስራ ለማመልከት፡ የተለጠፉ ስራዎችን ያስሱ፣ የሚፈልጉትን ስራ ይጫኑ፣ መስፈርቶችን ይገምግሙ እና የክህሎት ማሳያዎን (portfolio) እና የማመልከቻ ደብዳቤዎን በመያዝ 'አመልክት' (Apply) የሚለውን ይጫኑ።",
        "ለማመልከት፡ ከክህሎትዎ ጋር የሚዛመድ ስራ ይፈልጉ፣ ዝርዝሩን ያንብቡ፣ የማመልከቻ ቁሳቁሶችን ያዘጋጁ እና በስራው ዝርዝር ገጽ በኩል ያቅርቡ።",
      ],
      feature: [
        "የHustleX አገልግሎቶች፡ ስራ መለጠፍ እና ማስተዳደር፣ ሰራተኛ መፈለግ፣ የቀጥታ መልእክት መለዋወጥ፣ የቪዲዮ ጥሪ፣ የፋይል ማያያዣ፣ የስራ ማመልከቻዎችን መከታተል፣ ደህንነቱ የተጠበቀ ክፍያ እና ዝርዝር ፕሮፋይሎችን ያካትታል።",
        "ቁልፍ ባህሪያት፡ የስራ ገበያ፣ የፍሪላንሰሮች ዝርዝር፣ ፈጣን መልእክት፣ የቪዲዮ ግንኙነት፣ ፋይል ማጋራት፣ የማመልከቻ ስርዓት እና የክፍያ ሂደት።",
      ],
      price: [
        "HustleX ተለዋዋጭ ዋጋዎችን ያቀርባል። ለበለጠ መረጃ እባክዎን ያግኙን ወይም የእኛን የዋጋ ገጽ ይጎብኙ።",
        "ዋጋዎች እንደ ፍላጎትዎ ይለያያሉ። ስለ ወጪዎች እና የክፍያ አማራጮች መረጃ ለማግኘት የዋጋ ክፍላችንን ይመልከቱ ወይም ድጋፍ ሰጪ ቡድናችንን ያነጋግሩ።",
      ],
      contact: [
        "በእውቂያ ገጻችን (Contact Us)፣ በኢሜይል ወይም በድጋፍ ማዕከላችን በኩል ሊያገኙን ይችላሉ። ለማንኛውም ጥያቄ ልንረዳዎ ዝግጁ ነን!",
        "በእውቂያ ገጽ፣ በኢሜይል ወይም በድጋፍ መስመሮቻችን በኩል ያግኙን። ቡድናችን በHustleX ላይ ስኬታማ እንዲሆኑ ለመርዳት ዝግጁ ነው።",
      ],
      patterns: [
        { keywords: ["ምንድን", "ምንድነው", "ስለ", "ማብራሪያ", "አስረዳኝ", "መረጃ"], topic: "platform" },
        { keywords: ["መለጠፍ", "መፍጠር", "ስራ ለመለጠፍ", "ማሰራት", "ስራ ለጥፍ", "ስራ"], topic: "job" },
        { keywords: ["ሰራተኛ", "ነጻ ሰራተኛ", "ፍሪላንሰር", "ባለሙያ", "ማግኘት", "መፈለግ"], topic: "freelancer" },
        { keywords: ["መመዝገብ", "መመዝገቢያ", "መቀላቀል", "ሳይን", "አካውንት"], topic: "signup" },
        { keywords: ["ማመልከት", "ማመልከቻ", "መወዳደር", "አመልክት", "ቢድ"], topic: "apply" },
        { keywords: ["አገልግሎት", "ፊውቸር", "ጥቅም", "ማድረግ"], topic: "feature" },
        { keywords: ["ዋጋ", "ክፍያ", "ገንዘብ", "ዋጋው", "ክፍያዎች"], topic: "price" },
        { keywords: ["እውቂያ", "ማግኘት", "ድጋፍ", "እርዳታ", "ስልክ", "ኢሜይል"], topic: "contact" },
      ],
      thankYou: "ምንም አይደል! 😊 ስለ HustleX ተጨማሪ እርዳታ ከፈለጉ ለመጠየቅ ነጻ ይሁኑ!",
      greeting: "ሰላም! 👋 ወደ HustleX እንኳን በደህና መጡ! ስለ መድረካችን መረጃ ለመስጠት ዝግጁ ነኝ። ስራ መለጠፍን፣ ነጻ ሰራተኛ መፈለግን፣ መመዝገብን፣ አገልግሎቶችን ወይም ሌላ ማንኛውንም ስለ HustleX መጠየቅ ይችላሉ። ምን ማወቅ ይፈልጋሉ?",
      unrelated: [
        "ለጥያቄዎ አመሰግናለሁ! 😊 እኔ የHustleX ረዳት ነኝ፣ ስለ ፍሪላንሲንግ መድረካችን ለመርዳት የተዘጋጀሁ። ስለ ሌላ ነገር ማውራት ደስ ቢለኝም፣ ስለ HustleX ጥያቄዎችን ብመልስ የተሻለ ነው። ዛሬ ስለ HustleX ምን ልረዳዎ እችላለሁ?",
        "ይህ በጣም አስደሳች ርዕስ ነው! እዚህ የተገኘሁት በተለይ HustleXን በተመለከተ ለመርዳት ቢሆንም፣ ስለ መድረካችን ጥያቄዎች ቢኖሩዎት ደስ እያለኝ እረዳዎታለሁ። ምን ማወቅ ይፈልጋሉ? 😊",
        "ስለ ጥያቄዎ እናመሰግናለን! እኔ የHustleX ረዳት ነኝ፣ ስለዚህ ስለ መድረኩ ጥያቄዎች ቢጠይቁኝ ፈጣን እና ትክክለኛ ምላሽ ማግኘት ይችላሉ። ዛሬ በምን ልርዳዎት? 🤖"
      ],
      default: `ስለ "${message}" መጠየቅዎን ተረድቻለሁ። እኔ ስለ HustleX መድረክ ጥያቄዎች ለመመለስ ዝግጁ ነኝ፣ በተለይም በእነዚህ ርዕሶች ላይ መርዳት እችላለሁ፡\n\n• **ስለ መድረኩ**: HustleX ምንድን ነው እና እንዴት ይሰራል\n• **ስራ መለጠፍ**: እንዴት የስራ ማስታወቂያዎችን መፍጠር እና ማስተዳደር እንደሚቻል\n• **ሰራተኞችን መፈለግ**: ባለሙያዎችን መፈለግ እና ማግኘት\n• **ለመጀመር**: መመዝገብ እና አካውንት መክፈት\n• **ማመልከቻዎች**: ፍሪላንሰሮች ለስራዎች እንዴት ማመልከት እንደሚችሉ\n• **አገልግሎቶች**: የመድረኩን ዝርዝር አገልግሎቶች ማሰስ\n• **ድጋፍ**: የእውቂያ እና የእርዳታ መረጃዎች\n\nእባክዎን ጥያቄዎን በሌላ መንገድ ይጠይቁ ወይም ከእነዚህ ርዕሶች አንዱን ይምረጡ። ለመርዳት ዝግጁ ነኝ! 🤖`
    },
    om: {
      platform: [
        "HustleX'n plaatformii hojii bilisaa (freelancing) Itoophiyaa keessatti ogeeyyii bilisaa fi abbootii qabeenyaa/daldaltoota wal-qunnamsiisudha. Hojii baasuu, hojjataa barbaaduu, ergaa erguu, viidiyoodhaan haasa'uu fi kaffaltii amansiisaa of keessaa qaba.",
        "HustleX gabaa hojjattoonni bilisaa dandeettii isaanii itti agarsiisanii fi maamiloonni ogeeyyii itti barbaaddatanidha. Hojii bulchuu, wal-qunnamtii battalaa fi odeeffannoo dhuunfaa qopheessuu of keessaa qaba.",
      ],
      job: [
        "Hojii baasuuf: Gara 'Hojii Baasi' (Post a Job) deemaa, mata-duree hojii, ibsa, baajeta fi ulaagaalee galchuudhaan gadi lakkisaa. Hojiin keessan hojjattoota bilisaaf kan mul'atu ta'a.",
        "Hojii baasuun salphaadha: Fuula 'Post Job' jedhu deemaa, odeeffannoo hojii guutaa, baajeta fi yeroo murteessaa, achiis maxxansaa. Freelancer'onni iyyachuu danda'u.",
      ],
      freelancer: [
        "Hojjattoota argachuuf: Tarreeffama hojjattootaa ilaaluun, dandeettii, muuxannoo fi iddoo hojiitiin calaluun ykn hojii baasuun iyyata dhiyaate madaaluun danda'ama.",
        "Ogeeyyii bilisaa barbaaduuf meeshaa barbaacha keenya filter fayyadamanii daawwachuu ykn hojii maxxansanii iyyata dhiyate madaaluu danda'u.",
      ],
      signup: [
        "Galmaa'uuf: 'Galmaa'i' (Sign Up) kan jedhu cuqaasaa, gahee keessan filadhaa (Hojjataa Bilisaa ykn Hojjachiisaa), email fi odeeffannoo keessan galchuun galmee xumuraa.",
        "Galmeen salphaadha: 'Galmaa'i' cuqaasaa, ogeessa bilisaa (Freelancer) ykn maamiloota (Client) filadhaa, odeeffannoo keessan guutaa, email keessan mirkaneessaa.",
      ],
      apply: [
        "Hojiif iyyachuuf: Maxxansa hojii daawwadhaa, hojii isinitti tole cuqaasaa, ulaagaalee dubbisaa, portfolio fi xalayaa iyyataa keessaniin 'Iyyadhu' (Apply) cuqaasaa.",
        "Iyyachuuf: Hojii dandeettii keessan waliin deemu barbaadaa, odeeffannoo isaa dubbisaa, qophaa'aa, achiis fuula hojjachaa irratti iyyata keessan galchaa.",
      ],
      feature: [
        "Amaloota HustleX: Hojii baasuu fi bulchuu, hojjataa barbaaduu, ergaa battalaa, waamicha viidiyoo, faayila wal qabsiisuu, iyyata hordofuu, kaffaltii eegumsa qabuu fi profile guutuu dha.",
        "Tajaajiloota ijoo: Gabaa hojii, tarree ogeeyyii bilisaa, ergaa instant, qunnamtii viidiyoo, faayila wal-jijjiiruu, sirna iyyataa fi kaffaltii.",
      ],
      price: [
        "HustleX gatii madaalawaa fi jijjiiramuu danda'u qaba. Odeeffannoo dabalataaf nu qunnamaa ykn fuula gatii (Pricing) keenya daawwadhaa.",
        "Gatiin akka fedhii keessaniiti. Waa'ee gatii fi kaffaltii odeeffannoo argachuuf fuula pricing ilaalaa ykn gargaarsa gaafadhaa.",
      ],
      contact: [
        "Fuula 'Nu Qunnamsiisa' (Contact Us) jedhuun, email gargaarsaan ykn giddu-gala gargaarsa keenyaan nu qunnamaa. Gaaffii keessaniif si'aayinaan deebisna!",
        "Nu qunnamaa fuula qunnamtii irratti, email ykn karaa gargaarsaa. Gareen keenya HustleX irratti akka milkooftan isin gargaaruuf qophiidha.",
      ],
      patterns: [
        { keywords: ["maali", "maalidha", "waa'ee", "ibsi", "naaf ibsi", "odeeffannoo"], topic: "platform" },
        { keywords: ["baasuu", "uumuu", "hojii baasuuf", "hojjachiisuu", "maxxansuu"], topic: "job" },
        { keywords: ["hojjataa", "ogeessa", "ogeeyyii", "freelancer", "barbaaduu", "argachuu"], topic: "freelancer" },
        { keywords: ["galmaa'uu", "galmeessuu", "seenuu", "akaawuntii", "saayin", "banuu"], topic: "signup" },
        { keywords: ["iyyachuu", "dorgomuu", "iyyata", "apply", "biid"], topic: "apply" },
        { keywords: ["tajaajila", "amala", "amaloota", "faayidaa"], topic: "feature" },
        { keywords: ["gatii", "kaffaltii", "maallaqa", "gatiin"], topic: "price" },
        { keywords: ["qunnamuu", "argachuu", "gargaarsa", "bilbila", "email", "qunnamtii"], topic: "contact" },
      ],
      thankYou: "Galatoomaa! 😊 Waa'ee HustleX gargaarsi dabalataa yoo barbaachise nu gaafachuu hin sodaatinaa!",
      greeting: "Akkam! 👋 Baga nagaan gara HustleX dhuftan! Ani gargaaraa keessani, waa'ee plaatformii keenyaa isin gargaaruuf qophiidha. Hojii baasuu, hojjataa bilisaa barbaaduu, galmee, tajaajiloota ykn waan biraa kamiyyuu gaafachuu dandeessu. Maal beekuu barbaaddu?",
      unrelated: [
        "Gaaffii keessaniif galatoomaa! 😊 Ani gargaaraa HustleX waan ta'eef, waa'ee plaatformii hojii bilisaa keenyaa qofa deebisuu danda'a. Waa'ee biraa haasa'uun namatti tolullee, waa'ee HustleX yoo ta'e gaariidha. Har'a maal isin gargaaru?",
        "Mata-dureen kun baay'ee namatti tola! Haa ta'u malee, ani kan uumame waa'ee HustleX gargaaruuf waan ta'eef, waa'ee hojii fi tajaajila keenyaa gaaffii yoo qabaattan deebisuu nan danda'a. Maal beekuu barbaaddu? 😊",
        "Waa'ee gaaffii keetiif galatoomaa! Ani gargaaraa HustleX ti, kanaafuu waa'ee plaatformii keenyaa yoo gaafatte siif gaariidha. Har'a maaliin si gargaaru? 🤖"
      ],
      default: `Waa'ee "${message}" gaafachuu kee hubadheera. Ani waa'ee plaatformii HustleX deebisuuf qophiidha, keessattuu dhimmoota kanneen irratti si gargaaruu danda'a:\n\n• **Odeeffannoo Plaatformii**: HustleX maali fi akkamitti hojjata\n• **Hojii Maxxansuu**: Hojii akkamitti uumuu fi bulchuu dandeessa\n• **Hojjattoota Barbaaduu**: Ogeeyyii argachuu fi qunnamuu\n• **Jalqabuuf**: Galmaa'uu fi account banuu\n• **Iyyata Hojii**: Freelancer'onni akkamitti iyyachuu danda'u\n• **Tajaajiloota**: Amaloota plaatformii kanneen biraa\n• **Qunnamtii**: Odeeffannoo qunnamtii fi gargaarsaa\n\nMaaloo gaaffii kee karaa biraatiin gaafadhu ykn dhimmoota kanneen keessaa filadhu. Si gargaaruuf qophiidha! 🤖`
    },
    ti: {
      platform: [
        "HustleX ላዕለዎት ናይ ኢትዮጵያ ነጻ ሰራሕተኛታት (freelancers) ምስ ዓማዊል ዘራኽብ መድረኽ እዩ። ስራሕ ምልጣፍ፣ ሰራሕተኛ ምድላይ፣ ቀጥታ መልእኽቲ፣ ቪድዮ ጻውዒት፣ ፋይል ምክፋልን ውሑስ ክፍሊትን የጠቓልል።",
        "HustleX ነጻ ሰራሕተኛታት ክእለቶም ዘርእዩሉ ዓማዊል ድማ ክኢላታት ዝረኽቡሉ ዕዳጋ እዩ። ስራሕ ምክትታል፣ ናይ ቀጥታ ርክብን ናይ ፕሮፋይል ምምሕያሽን ዝሓዘ እዩ።",
      ],
      job: [
        "ስራሕ ንምልጣፍ፡ ናብ 'ስራሕ ለጥፍ' (Post a Job) ገጽ ብምኻድ፣ ኣርእስቲ ስራሕ፣ መግለጺ፣ ባጀትን መስፈርትን ብምምላእ ይለጥፉ። ስራሕኩም ነጻ ሰራሕተኛታት ክርእይዎ ክልእኩን ይኽእሉ እዮም።",
        "ስራሕ ምልጣፍ ቀሊል እዩ፡ 'ስራሕ ለጥፍ' ዝብል ጠውቑ፣ ዘድልየኩም ስራሕ ዝርዝር ኣእትዉ፣ ባጀትን ግዜን ወስኑ፣ ድሕሪኡ ኣሕትምዎ። ሰራሕተኛታት ክርእይዎን ከምልክቱን እዮም።",
      ],
      freelancer: [
        "ሰራሕተኛታት ንምርካብ፡ ዝርዝር ሰራሕተኛታት ብምርኣይ፣ ማጣሪያታት (ክእለት፣ ተመክሮ፣ ቦታ) ብምጥቃም ወይ ስራሕ ብምልጣፍን ዝመጹ ማመልከቻታት ብምግምጋምን ምርካብ ይከኣል።",
        "ነጻ ሰራሕተኛታት ብናይ ፍለጋ መሳርሒና ማጣሪያታት ተጠቒምኩም ክትረኽቡ፣ ፕሮፋይሎም ክትበጽሑ ወይ ስራሕ ለጢፍኩም ማመልከቻታት ክትቅበሉ ትኽእሉ ኢኹም።",
      ],
      signup: [
        "ንምምዝጋብ፡ 'ተመዝገብ' (Sign Up) ዝብል ጠውቑ፣ ግደኹም ምረጹ (ነጻ ሰራሕተኛ ወይ ዓሚል)፣ ኢሜይልን መረዳእታን ብምእታው ምዝገባኹም ዛዝሙ።",
        "ምዝገባ ቀሊል እዩ፡ 'ተመዝገብ' ጠውቑ፣ ከም ፍሪላንሰር ወይ ዓሚል ኣካውንት ክፈቱ፣ ሓበሬታኹም ሙሉእ፣ ድሕሪኡ ኢሜይልኩም ኣረጋግጹ።",
      ],
      apply: [
        "ንስራሕ ንምምልካት፡ ዝተለጠፉ ስራሕቲ ርኣዩ፣ ዝደለኹምዎ ስራሕ ጠውቑ፣ መስፈርታት ገምግሙ እሞ ፖርትፎሊዮኹምን ናይ መእተዊ ጽሑፍኩምን ሒዝኩም 'ኣመልክት' (Apply) ጠውቑ።",
        "ንክትወዳደሩ፡ ምስ ክእለትኩም ዝሰማማዕ ስራሕ ድለዩ፣ ዝርዝሩ የንብቡ፣ ናይ ምወዳደሪ ጽሑፍኩም ኣዳልዩ፣ ብገጽ ዝርዝር ስራሕ ኣቢልኩም ኣእትውዎ።",
      ],
      feature: [
        "ናይ HustleX ኣገልግሎታት፡ ስራሕ ምልጣፍን ምክትታልን፣ ሰራሕተኛ ምድላይ፣ ቀጥታ መልእኽቲ፣ ቪድዮ ጻውዒት፣ ፋይል ምክፋል፣ ማመልከቻታት ምክትታል፣ ውሑስ ክፍሊትን ምሉእ ፕሮፋይልን የጠቓልል።",
        "ዓበይቲ ኣገልግሎታት፡ ዕዳጋ ስራሕ፣ ዝርዝር ነጻ ሰራሕተኛታት፣ ቅጽበታዊ መልእኽቲ፣ ቪድዮ ርክብ፣ ፋይል ምክፋልን ናይ ክፍሊት መስርሕን።",
      ],
      price: [
        "HustleX ተለዋዋጢ ዋጋታት የቕርብ። ንተወሳኺ ሓበሬታ በጃኹም ርኸቡና ወይ ገጽ ዋጋና (Pricing) ይጎብኙ።",
        "ዋጋታት ከም ፍላጎትኩም ይፈላለዩ። ብዛዕባ ወጻኢታትን ናይ ክፍሊት ኣማራጺታትን ሓበሬታ ንምርካብ ገጽ ዋጋና ርኣዩ ወይ ንሓገዝ ርኸቡና።",
      ],
      contact: [
        "ብገጽ ርኸብና (Contact Us)፣ ብኢሜይል ወይ ብማእከል ሓገዝና ክትረኽቡና ትኽእሉ ኢኹም። ንማንኛውም ሕቶ ክንሕግዘኩም ድሉዋት ኢና!",
        "ብገጽ ርኸብና፣ ብኢሜይል ወይ ብናይ ሓገዝ መስመራትና ኣቢልኩም ተወከሱና። ጋንታና ኣብ HustleX ክትዕወቱ ንምሕጋዝ ድሉው እዩ።",
      ],
      patterns: [
        { keywords: ["እንታይ", "እንታይ እዩ", "ብዛዕባ", "መግለጺ", "ሓብሩኒ", "ሓበሬታ"], topic: "platform" },
        { keywords: ["ምልጣፍ", "ምፍጣር", "ስራሕ ንምልጣፍ", "ምቑጻር", "ስራሕ ለጥፍ", "ስራሕ"], topic: "job" },
        { keywords: ["ሰራሕተኛ", "ነጻ ሰራሕተኛ", "ፍሪላንሰር", "ክኢላ", "ምርካብ", "ምድላይ"], topic: "freelancer" },
        { keywords: ["ምምዝጋብ", "ምምዝጋብ", "ምእታው", "ሳይን", "ኣካውንት"], topic: "signup" },
        { keywords: ["ማመልከት", "ማመልከቻ", "ምወዳደር", "ኣመልክት", "ቢድ"], topic: "apply" },
        { keywords: ["ኣገልግሎት", "ፊውቸር", "ጥቕሚ", "ምግባር"], topic: "feature" },
        { keywords: ["ዋጋ", "ክፍሊት", "ገንዘብ", "ዋጋታት", "ክፍሊታት"], topic: "price" },
        { keywords: ["ምርካብ", "ሓገዝ", "ድጋፍ", "ስልኪ", "ኢሜይል", "ርኸቡና"], topic: "contact" },
      ],
      thankYou: "የቀንየለይ! 😊 ብዛዕባ HustleX ተወሳኺ ሓገዝ እንተደሊኹም ክትሓቱ ትኽእሉ ኢኹም!",
      greeting: "ሰላም! 👋 ናብ HustleX ብደሓን መጻእኩም! ብዛዕባ መድረኽና ሓበሬታ ክህበኩም ድሉው እየ። ብዛዕባ ስራሕ ምልጣፍ፣ ሰራሕተኛ ምድላይ፣ ምምዝጋብ፣ ኣገልግሎታት ወይ ካልእ ብዛዕባ HustleX ክትሓቱኒ ትኽእሉ ኢኹም። እንታይ ክትፈልጡ ትደልዩ?",
      unrelated: [
        "ሕቶኹም አምስግን! 😊 ኣነ ናይ HustleX ሓጋዚ እየ፣ ብዛዕባ መድረኽና ክሕግዝ ዝተዳለኹ። ብዛዕባ ካልእ ነገር ምዕላል ደስ ዝብል እኳ እንተኾነ፣ ብዛዕባ HustleX ሕቶታት እንተመለስኩ ይምረጽ። ሎሚ ብዛዕባ HustleX እንታይ ክሕግዘኩም?",
        "እዚ ብጣዕሚ ዝስሕብ ኣርእስቲ እዩ! ኣብዚ ዝረኸብኩዎ ብፍላይ HustleX ንምሕጋዝ እኳ እንተኾነ፣ ብዛዕባ መድረኽና ሕቶታት እንተሃልዩኩም ክሕግዘኩም ደስ ይበለኒ። እንታይ ክትፈልጡ ትደልዩ? 😊",
        "ብዛዕባ ሕቶኹም የቀንየለይ! ኣነ ናይ HustleX ሓጋዚ እየ፣ ስለዚ ብዛዕባ መድረኽና እንተሓቲትኩምኒ ፈጣንን ትክክለኛን ምላሽ ክትረኽቡ ትኽእሉ ኢኹም። ሎሚ ብምንታይ ክሕግዘኩም? 🤖"
      ],
      default: `ብዛዕባ "${message}" ምሕታትኩም ተረዲአ ኣለኹ። ኣነ ብዛዕባ HustleX መድረኽ ሕቶታት ንምምላስ ድሉው እየ፣ ብፍላይ ድማ ኣብዞም ኣርእስትታት ክሕግዘኩም እኽእል እየ፡\n\n• **ብዛዕባ መድረኽ**: HustleX እንታይ እዩ ከመይ ይሰርሕ\n• **ስራሕ ምልጣፍ**: ከመይ ጌርካ ስራሕቲ ክትፈጥርን ከተመሓድርን ትኽእል\n• **ሰራሕተኛታት ምድላይ**: ክኢላታት ምድላይን ምርካብን\n• **ንምጅማር**: ምምዝጋብን ኣካውንት ምኽፋትን\n• **ማመልከቻታት**: ፍሪላንሰራት ንስራሕቲ ከመይ ከምልከቱ ከምዝኽእሉ\n• **ኣገልግሎታት**: ዝርዝር ኣገልግሎታት መድረኽ ምርኣይ\n• **ሓገዝ**: ናይ ርክብን ሓገዝን ሓበሬታታት\n\nበጃኹም ሕቶኹም ብኻልእ መንገዲ ሕተቱ ወይ ካብዞም ኣርእስትታት ሓደ ምረጹ። ንምሕጋዝ ድሉው እየ! 🤖`
    }
  };

  const currentLangConfig = knowledgeBase[language] || knowledgeBase["en"];

  // Language-specific thank you keywords
  const thankYouKeywords = {
    en: ["thank", "thanks", "appreciate"],
    am: ["አመሰግናለሁ", "እናመሰግናለን", "አመሰግናለው", "አመሰግናለህ"],
    om: ["galatoomaa", "galatoomi", "galateeffadhaa"],
    ti: ["የቀንየለይ", "የቐንየለይ", "የቀንየለይና", "ተመስገን"]
  };
  
  const allThankYous = [
    ...thankYouKeywords.en,
    ...thankYouKeywords.am,
    ...thankYouKeywords.om,
    ...thankYouKeywords.ti
  ];

  if (allThankYous.some(kw => normalized.includes(kw))) {
    return currentLangConfig.thankYou;
  }

  // Check patterns for matched topic
  for (const pattern of currentLangConfig.patterns) {
    if (pattern.keywords.some((kw) => normalized.includes(kw))) {
      const answers = currentLangConfig[pattern.topic];
      if (answers) {
        return answers[Math.floor(Math.random() * answers.length)];
      }
    }
  }

  // Context-aware response
  if (conversationHistory.length > 0) {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage.sender === "bot" && (
      normalized.includes("yes") || normalized.includes("ok") || normalized.includes("thanks") ||
      normalized.includes("አዎ") || normalized.includes("እሺ") ||
      normalized.includes("eeyyee") || normalized.includes("tole") ||
      normalized.includes("እወ") || normalized.includes("ሕራይ")
    )) {
      if (language === "am") return "በጣም ጥሩ! ስለ HustleX ሌላ ልረዳዎ የምችለው ነገር አለ?";
      if (language === "om") return "Baay'ee gaarii! Waa'ee HustleX dhimmi biraa si gargaaru danda'u jiraa?";
      if (language === "ti") return "ብጣዕሚ ጽቡቕ! ብዛዕባ HustleX ካልእ ክሕግዘኩም ዝኽእል ነገር ኣሎ?";
      return "Great! Is there anything else I can help you with about HustleX?";
    }
  }

  // Greeting detection
  const greetingKeywords = {
    en: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"],
    am: ["ሰላም", "እንደምን", "ታዲያስ", "ሰላም ነው", "ጤና ይስጥልኝ"],
    om: ["akkam", "nagaan", "ashamaa", "akkam jirtu", "baga nagaan dhuftan"],
    ti: ["ሰላም", "ከመይ", "እንቋዕ", "እንቋዕ ብደሓን መጻእኩም", "ከመይ ኣለኹም"]
  };

  const allGreetings = [
    ...greetingKeywords.en,
    ...greetingKeywords.am,
    ...greetingKeywords.om,
    ...greetingKeywords.ti
  ];

  if (allGreetings.some(kw => normalized.includes(kw))) {
    return currentLangConfig.greeting;
  }

  // Detect unrelated topics and redirect
  const unrelatedKeywords = [
    "weather", "temperature", "rain", "snow", "forecast", "climate", "የአየር ፀባይ", "ዝናብ", "rooba", "qilleensa", "ንፋስ", "ማይ",
    "sports", "football", "basketball", "soccer", "cricket", "tennis", "game", "match", "score", "እግር ኳስ", "ስፖርት", "tapha", "ኩዕሶ",
    "recipe", "cooking", "food", "restaurant", "ምግብ", "የምግብ አሰራር", "nyaata", "restaurant", "መግቢ",
    "movie", "film", "actor", "celebrity", "entertainment", "ፊልም", "ቲያትር", "agarsiisa", "ፊልምታት",
    "politics", "election", "government", "president", "ፖለቲካ", "መንግስት", "siyaasa", "ፖለቲካዊ",
    "science", "physics", "chemistry", "biology", "mathematics", "math", "ሳይንስ", "ሒሳብ", "herrega", "ስነ ፍጥረት",
    "history", "war", "ancient", "historical", "ታሪክ", "ጦርነት", "seenaa", "ታሪኻዊ",
    "travel", "vacation", "hotel", "flight", "tourism", "ጉዞ", "ቱሪዝም", "imala", "ሆቴል", "ቱሪስት",
    "health", "medicine", "doctor", "hospital", "disease", "symptoms", "ጤና", "ዶክተር", "ሆስፒታል", "fayyaa", "ሕክምና",
    "stock", "market", "crypto", "bitcoin", "investment", "trading", "ክሪፕቶ", "ኢንቨስትመንት", "crypto", "ቢትኮይን",
    "other platform", "upwork", "fiverr", "competitor", "አፕወርክ", "ፋይቨር", "upwork", "fiverr"
  ];

  const isUnrelated = unrelatedKeywords.some(keyword => normalized.includes(keyword));
  const hustlexKeywords = [
    "hustlex", "freelance", "freelancer", "job", "client", "platform", "marketplace", "apply", "post", "hire",
    "ሃስልኤክስ", "ነጻ ሰራተኛ", "ፍሪላንሰር", "ስራ", "ደንበኛ", "ቀጣሪ", "መለጠፍ", "ማመልከት", "ለመመዝገብ",
    "hojii", "hojjataa", "bilisaa", "daldala", "koontrat", "iyyachuu", "galmee", "maxxansuu",
    "ሰራሕተኛ", "ዓሚል", "ስራሕ", "ምልጣፍ", "ምምዝጋብ"
  ];
  const hasHustlexContext = hustlexKeywords.some(keyword => normalized.includes(keyword));

  if (isUnrelated && !hasHustlexContext) {
    return currentLangConfig.unrelated[Math.floor(Math.random() * currentLangConfig.unrelated.length)];
  }

  // Default response
  return currentLangConfig.default;
}

module.exports = router;
