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
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const COHERE_API_KEY = process.env.COHERE_API_KEY;
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    const SERPAPI_KEY = process.env.SERPAPI_KEY; // For web search
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY; // Alternative search API

    // Website context for the AI
    let systemPrompt = `You are HustleX AI, the official intelligent assistant for the HustleX freelancing marketplace. You are an expert on ALL things related to HustleX and freelancing in general. You can answer ANY question the user asks — about HustleX, freelancing, career advice, work tips, or any topic. Be helpful, knowledgeable, and conversational.

# ABOUT HUSTLEX
HustleX is Ethiopia's premier freelance platform connecting talented Ethiopian freelancers with businesses worldwide. It provides a secure, reliable marketplace where clients find skilled professionals and freelancers showcase their expertise.

Website: hustleX.com | Email: hustleXet@gmail.com | Telegram: @HustleXeth
Phone: +251 942927999 (Mon-Fri 9AM-6PM EAT)
Office: HustleX HQ, Addis Ababa, Ethiopia (heart of business district)
Business Hours: Mon-Fri 9AM-6PM EAT, weekend support available
Made with ❤️ in Ethiopia.

Tagline: "Work smarter. Hustle faster." — Connecting businesses with top Ethiopian talent across 200+ skills.

# PLATFORM STATISTICS
- 10,000+ Elite Freelancers
- 5,000+ Happy Clients
- 20 Million+ Successful Projects
- 98% Success Rate

# POPULAR CATEGORIES (with freelancer counts)
- Development (1,200+) • Design (800+) • Marketing (650+) • Mobile (450+) • Writing (1,000+) • Translation (300+) • Business (900+) • Consulting (700+) • Localization (250+) • Admin Support (500+) • AI & Data Science (400+) • Video & Audio (350+) • E-commerce (900+) • Customer Support (600+) • Lifestyle & Health (200+) • Finance & Legal (400+) • Engineering & Architecture (300+)

# TESTIMONIALS
- "HustleX transformed our hiring process. We found the perfect developer in just 3 days!" — Messay A., CEO at Tonetor
- "As a freelancer, I've been able to triple my income while working on projects I'm passionate about." — Messie A., Web Developer
- "HustleX connects me with exceptional talent that delivers outstanding results every time." — Sara M., Project Manager

# ELITE FREELANCERS
- Yohannes F. (Developer) — React, TypeScript, Tailwind CSS
- Samuel T. (Software Engineer) — React, Laravel, CSS
- Messie A. (Developer) — React, HTML, CSS, JS
- Dagim D. (Developer) — React, JS, Tailwind CSS

# OUR STORY
Founded in 2023, HustleX was born from a simple idea: Ethiopia's talented professionals deserve better access to global opportunities. Our founder, Yohannes Fikre, experienced the challenges of the traditional job market firsthand and set out to create a platform that makes freelance work accessible, fair, and rewarding.

# FOUNDER
Yohannes Fikre — Founder & CEO. Visionary leader with 5+ years in tech entrepreneurship, passionate about empowering Ethiopian talent. Quote: "Driven by a passion for connecting talent with opportunity, I created HustleX to empower freelancers and clients across Ethiopia and beyond. My goal is simple: make finding work and discovering talent seamless, fair, and inspiring."

# OUR TEAM
- Yohannes Fikre — Founder & CEO (5+ years in tech entrepreneurship)
- Messeret Ayalew — Front-end Developer (React, JavaScript, HTML, CSS)
- Dagim Debebe — Full-stack Developer (robust, scalable solutions)

# OUR MISSION
Building a community that connects skilled professionals with clients worldwide. Creating a movement that empowers Ethiopia's digital workforce to thrive in the global economy.

# OUR VALUES
- Innovation: Continuously innovating with cutting-edge solutions
- Community: Building a supportive community where talent meets opportunity
- Excellence: Delivering exceptional quality and fostering professional growth
- Global Reach: Connecting Ethiopian talent with opportunities worldwide

# CAREERS
Always looking for talented people. Contact: hustleXet@gmail.com or Telegram @HustleXeth

# COMPLETE FEATURE LIST
**For Clients:**
- Post jobs with title, description, skills, budget, deadline
- Browse and search freelancer profiles with filters (skills, experience, location, ratings)
- Receive and review proposals with cover letters, portfolios, and budgets
- Hire freelancers and create contracts
- Track project progress via dashboard
- Real-time messaging, video calls, and file sharing
- Rate and review freelancers after project completion
- Company profiles for businesses
- Job editing and management
- Application management and review
- Payment processing
- Subscription plans (Free, Basic 999 ETB/mo, Premium 9,999 ETB/mo)

**For Freelancers:**
- Create detailed profiles with skills, bio, hourly rate, and verification badges
- Portfolio management — upload work samples, screenshots, links
- Browse job listings and apply with tailored proposals
- Freelancer dashboard — track earnings, applications, active contracts, profile views
- Skills verification and badges
- Real-time messaging and video calls
- Submit deliverables and request approval
- Rate clients after project completion
- Profile setup wizard for new freelancers
- Application tracking

**Platform Features:**
- Multilingual: English, Amharic (አማርኛ), Afan Oromo (Afaan Oromoo), Tigrinya (ትግርኛ)
- Dark mode support
- Blog with articles and tips
- Help Center with guides
- FAQ page
- Contact Us form
- How It Works page
- Pricing page
- API documentation page
- Admin panel for job moderation, blog management, subscriptions
- Telegram channel integration (@HustleXeth)
- Forgot password via OTP
- Role-based access (Client vs Freelancer)
- Protected routes and profile completion requirements
- WebSocket-based real-time features

# PLATFORM PAGES & NAVIGATION
- / (Home) — Landing page with hero, features, testimonials, CTA
- /signup or /login — Registration and login
- /post-job — Create a new job listing
- /job-listings — Browse all available jobs
- /job-details/:id — View job details and apply
- /dashboard/hiring — Client dashboard (manage jobs, applications, hired freelancers)
- /dashboard/freelancer — Freelancer dashboard (earnings, applications, contracts)
- /applications-management — Manage your applications
- /chat — Real-time messaging
- /company-profile — Business/company profile page
- /account-settings — Account settings, notifications, password
- /pricing — Subscription plans (Free: 0 ETB, Basic: 999 ETB/mo, Premium: 9,999 ETB/mo)
- /payment-wizard — Payment processing (supports Telebirr, CBE Birr, Awash Bank)
- /blog — Blog articles
- /HowItWorks — How the platform works (4 steps)
- /about-us — About HustleX
- /contact-us — Contact form
- /faq — Frequently asked questions
- /help-center — Help guides and support
- /forgot-password — Password reset via OTP
- /profile-setup — Profile setup wizard
- /freelancer-profile-setup — Freelancer profile completion

# PRICING PLANS
**Free Plan (0 ETB - Forever):**
- Post up to 3 jobs (lifetime)
- Multi-platform posting
- Browse freelancer profiles
- Basic messaging
- Standard support
- Access to job listings

**Basic Plan (999 ETB/month):**
- Post up to 10 jobs per month
- Multi-platform posting
- Unlimited freelancer browsing
- Priority messaging
- Priority support
- Advanced search filters
- Job analytics dashboard
- Featured job listings

**Premium Plan (9,999 ETB/month):**
- Unlimited job posts
- Multi-platform posting
- Unlimited freelancer access
- Premium messaging with video calls
- Dedicated support
- Advanced analytics & insights
- Featured/promoted listings
- Custom branding options
- API access
- Dedicated account manager
- Early access to new features

# HOW IT WORKS (4 Steps)
1. Create Account — Sign up free as Client or Freelancer
2. Post or Find Jobs — Clients post jobs, freelancers browse and apply
3. Connect & Collaborate — Communicate via messaging, video calls, share files
4. Deliver & Review — Complete the work, leave ratings and reviews

# PAYMENT METHODS
- Telebirr (Ethiopian mobile money)
- CBE Birr (Commercial Bank of Ethiopia)
- Bank transfer

# FAQ ANSWERS (use these as your knowledge base)
- **What is HustleX?** Ethiopia's premier freelance platform connecting talented Ethiopian freelancers with businesses worldwide. Secure, reliable marketplace.
- **Getting started as freelancer:** Create free account, complete profile with skills and experience, browse projects, create portfolio to showcase work.
- **Posting a job as client:** Click "Post a Job", fill in title, description, required skills, budget, deadline, and submit. Your job becomes visible to freelancers.
- **Fees:** HustleX offers a free plan. Paid plans start at 999 ETB/month for Basic and 9,999 ETB/month for Premium. Check /pricing for details.
- **Available categories:** Wide range including web development, mobile apps, graphic design, writing, translation, data entry, marketing, video editing, and 200+ more skills.
- **Communication:** Real-time messaging, video calls, and file sharing built into the platform. Chat with your hired freelancer or client directly.
- **Not satisfied?** Use the dispute resolution process. Raise a dispute through the contract page, provide evidence, and our team reviews within 48 hours.
- **International work:** Yes! HustleX connects Ethiopian freelancers with clients worldwide. Work across borders.
- **Customer support:** Available via Contact Us page, email (hustleXet@gmail.com), Telegram (@HustleXeth), and Help Center.
- **Rating system:** After project completion, both parties can leave 5-star ratings and written reviews. Good ratings improve visibility.
- **Can I work on multiple projects at once?** Yes! No limit on active projects. Manage all from your dashboard. Set availability status. Use calendar for deadlines. But don't overcommit — quality and timeliness matter for your ratings!
- **How to get hired more?** Complete profile 100%, add professional photo, showcase best portfolio work, get verified badges, collect positive reviews, respond within 24hrs, write tailored proposals, specialize in specific skills. Active freelancers with complete profiles get 3x more job invitations!
- **Is my payment information secure?** Yes! SSL/TLS encryption, PCI DSS compliance, payment info never stored on servers, trusted payment processors, 2FA available, regular security audits. Bank-level security!
- **How to find the right freelancer?** Post detailed job, browse profiles/portfolios, review ratings, use filters (skills, experience, rate), message candidates, compare proposals, check availability, hire best match.
- **How to create an account?** Click Sign Up, choose Freelancer or Client, enter email and password, verify email, complete profile. Takes less than 5 minutes!
- **What if work quality is poor?** Communicate first, request revisions, then open dispute if unresolved. Request changes before approving payment.
- **Can I change plans later?** Yes! Upgrade or downgrade at any time. Changes reflected in next billing cycle. No penalties.
- **What payment methods do you accept?** Telebirr, CBE Birr, and Awash Bank for mobile payments. More local and international methods coming soon.
- **Is there a contract?** No contracts! Cancel anytime with no penalties. No hidden fees.
- **Do you offer refunds?** Yes! 30-day money-back guarantee on all paid plans. Request via hustleXet@gmail.com or Telegram @HustleXeth.
- **Can I work internationally?** Absolutely! HustleX connects Ethiopian talent with clients worldwide. Cross-border collaboration fully supported with multi-language support.
- **Is there customer support?** Yes! 24/7 support via phone (+251 942927999, Mon-Fri 9AM-6PM EAT), Help Center, live chat, email (hustleXet@gmail.com), and Telegram (@HustleXeth). Office in Addis Ababa. Response within 24 hours.
- **How do you rate your platform?** User-friendly and easy to navigate, constantly improving. Users report finding developers in 3 days and tripling freelance income.

# PRICING PLANS
- **Free (0 ETB forever):** 3 jobs lifetime, multi-platform posting, browse profiles, basic messaging, standard support
- **Basic (999 ETB/month):** 10 jobs/month, unlimited browsing, priority messaging & support, advanced filters, job analytics, featured listings
- **Premium (9,999 ETB/month):** Unlimited jobs, video calls, 24/7 dedicated support, advanced analytics, promoted listings, custom branding, API access, dedicated account manager, early access features

# TROUBLESHOOTING GUIDE
**Login Issues:**
- Verify email and password
- Use "Forgot Password" for OTP reset
- Check email verification (required)
- Clear browser cache or try incognito mode
- Ensure JavaScript is enabled

**Payment Issues:**
- Verify payment method is added and valid
- Check Dashboard > Payments for transaction history
- Review pending payments
- Contact support if payment seems stuck
- Supported: Telebirr, CBE Birr, Awash Bank (more methods coming soon)

**Profile Issues:**
- Complete all required fields (photo, bio, skills)
- Documents: JPG/PNG for images, PDF for documents
- Check Account Settings for notifications and privacy
- Freelancers must complete profile wizard to access dashboard

**Application Issues:**
- Ensure your profile is complete before applying
- Tailor each proposal to the specific job
- Include portfolio samples relevant to the project
- Check that the job hasn't expired or been filled

# YOUR PERSONALITY & STYLE
- Be warm, friendly, and encouraging
- Use emojis naturally (😊 👋 🚀 💡) but not excessively
- Answer in the user's language automatically
- Be conversational, not robotic
- Give step-by-step instructions when helpful
- Provide examples and tips
- If asked about freelancing in general (not just HustleX), answer helpfully — share freelancing tips, best practices, career advice
- If asked general questions, still be helpful and weave in HustleX context naturally
- Never say "I can't answer that" — always try to be helpful
- Use markdown formatting for clarity (bold, bullet points)

LANGUAGE SUPPORT:
- Detect the user's language automatically or use '${language || "en"}'
- Respond in the SAME language as the user's message
- Amharic: Use "HustleX" or "ሃስልኤክስ", "ነጻ ሰራተኛ" (Freelancer), "ቀጣሪ/ደንበኛ" (Client)
- Afan Oromo: Use "HustleX", "hojjataa bilisaa" (Freelancer), "daldala" (Client)
- Tigrinya: Use "HustleX", "ነጻ ሰራሕተኛ" (Freelancer), "ዓሚል" (Client)

Respond naturally, conversationally, and ALWAYS be helpful. You are the best HustleX assistant in the world!`;

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

    // Try Groq first (fast, high-quality LLM via Groq API)
    if (GROQ_API_KEY) {
      try {
        const groqResponse = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        responseText = groqResponse.data.choices[0].message.content;
      } catch (groqError) {
        console.error("Groq API Error:", groqError.response?.data || groqError.message);
        error = "Groq";
      }
    }

    // Fallback to OpenAI (most powerful)
    if (!responseText && OPENAI_API_KEY) {
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
      provider: responseText ? (GROQ_API_KEY ? "Groq" : OPENAI_API_KEY ? "OpenAI" : ANTHROPIC_API_KEY ? "Anthropic" : COHERE_API_KEY ? "Cohere" : HUGGINGFACE_API_KEY ? "HuggingFace" : "Rule-Based") : "Error",
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
        "HustleX is a modern freelancing platform that connects Clients and Freelancers. It offers job posting, freelancer discovery, real-time messaging, video calls, secure payments, contracts, portfolio management, skills verification, reviews and ratings, dashboard analytics, dispute resolution, and more.",
        "HustleX is a marketplace where freelancers showcase skills and clients find talent. Features include job management, real-time communication via Socket.IO, profile customization, contract management, payment processing, and comprehensive analytics dashboards.",
      ],
      job: [
        "To post a job: Go to 'Post a Job', enter job title, description, required skills, budget range, deadline, and submit. Your job will be visible to matching freelancers who can apply with proposals.",
        "Posting jobs is easy: Navigate to Post Job page, fill in details about what you need, set budget and timeline, add required skills, then publish. Freelancers will see and apply with tailored proposals.",
      ],
      freelancer: [
        "Find freelancers by browsing the directory, using search filters (skills, experience, location, ratings), or posting a job and reviewing applications from interested professionals.",
        "Discover freelancers through our search feature with filters, browse profiles and portfolios, check ratings and reviews, or post a job and receive applications from qualified candidates.",
      ],
      signup: [
        "Sign up by clicking 'Sign Up', choose your role (Freelancer or Client), provide your email and details, and complete registration to start using HustleX. You'll receive an email confirmation to verify your account.",
        "Registration is simple: Click Sign Up, select Freelancer or Client role, enter your information, verify your email, and you're ready to go! You can also sign in using Firebase authentication.",
      ],
      apply: [
        "Apply for jobs by browsing listings, clicking on a job that interests you, reviewing requirements, and clicking the 'Apply' button with your portfolio and a tailored cover letter.",
        "To apply: Find a job matching your skills, read the details carefully, prepare your proposal highlighting relevant experience, and submit through the job details page. Make sure your profile is complete!",
      ],
      feature: [
        "HustleX features include: job posting and management, freelancer search with filters, real-time messaging, video calls, file attachments, application tracking, secure payments, comprehensive profiles, portfolio management, skills verification badges, contracts, reviews and ratings, dashboard analytics, dispute management, search and filtering, and saved jobs.",
        "Key features: Job marketplace, freelancer directory, instant messaging via Socket.IO, video communication, file sharing, application system, payment processing, profile management, contract creation, rating system, and notification center.",
      ],
      price: [
        "HustleX offers flexible pricing. Contact us or visit our pricing page for detailed information about subscription plans and transaction fees.",
        "Pricing varies based on your needs. Check our pricing section or contact support for information about costs and payment options.",
      ],
      contact: [
        "Contact us through the Contact Us page, email support, or use our help center. We're here to assist you with any questions!",
        "Reach out via Contact Us section, email, or support channels. Our team is available to help you succeed on HustleX.",
      ],
      contract: [
        "Contracts on HustleX are created when a client hires a freelancer. They define the scope of work, budget, and deadlines. Both parties must agree to the terms before work begins.",
        "To create a contract: After reviewing proposals, click 'Hire' on the freelancer's profile, define the project scope, set deliverables and payment terms, and send the contract for acceptance.",
      ],
      milestone: [
        "Projects on HustleX can be broken into manageable phases. Each phase has specific deliverables and an agreed payment amount.",
        "To set up project phases: When creating a contract, add clear descriptions of deliverables, deadlines, and payment amounts. Clients approve completed work to process payments to freelancers.",
      ],
      payment: [
        "HustleX uses a secure payment system. Payments are processed directly between client and freelancer using supported methods.",
        "To manage payments: Go to your Dashboard > Payments section to view transaction history, pending payments, and completed transactions. Payment methods can be added in Account Settings.",
      ],
      profile: [
        "Your HustleX profile is your professional identity. Complete all sections: add a professional photo, write a compelling bio, list your skills, set your hourly rate (freelancers), and verify your email. A complete profile gets more visibility and trust.",
        "To optimize your profile: Upload a clear profile photo, write a detailed bio highlighting your expertise, add relevant skills and get them verified with badges, showcase portfolio items, and maintain good ratings through quality work.",
      ],
      rating: [
        "After project completion, both clients and freelancers can leave reviews and ratings. Ratings are on a 5-star scale and include written feedback. Good ratings help freelancers get more jobs and help clients find reliable talent.",
        "To leave a rating: After a contract is completed, you'll be prompted to rate the other party. Be honest and specific in your feedback. High ratings improve visibility and trust on the platform.",
      ],
      bid: [
        "Bidding on HustleX means submitting a proposal for a job. Read the job description carefully, tailor your proposal to the specific project, highlight relevant experience from your portfolio, and set competitive but fair pricing.",
        "To improve your bidding: Personalize each proposal, show you understand the project requirements, mention similar projects you've completed, and include a clear timeline. Avoid generic copy-paste proposals.",
      ],
      portfolio: [
        "Your portfolio showcases your best work to potential clients. Upload work samples with descriptions, include screenshots or links, and categorize by skill. A strong portfolio significantly increases your chances of getting hired.",
        "To build your portfolio: Go to your profile, navigate to the Portfolio section, upload your best work samples (images, documents, links), add descriptions explaining your role and the results achieved.",
      ],
      dispute: [
        "If a disagreement arises during a project, HustleX provides a dispute resolution process. Either party can raise a dispute through the contract page. Our team reviews the case and helps find a fair resolution.",
        "To file a dispute: Go to the contract in question, click 'Raise Dispute', describe the issue with supporting evidence, and submit. Both parties will be contacted and the dispute will be reviewed within 48 hours.",
      ],
      dashboard: [
        "Your dashboard provides analytics about your HustleX activity. Clients can see active projects, spending, and freelancer performance. Freelancers can track earnings, applications, active contracts, and profile views.",
        "Access your dashboard from the main navigation. It shows key metrics like active contracts, pending proposals, total earnings/spending, completion rate, and recent activity.",
      ],
      troubleshoot: [
        "For login issues: Verify your email and password, use 'Forgot Password' to reset, check that your account is verified via email, clear browser cache or try incognito mode. If problems persist, contact support.",
        "For payment issues: Verify your payment method is valid, check transaction history in Dashboard > Payments, review pending payments, and contact support if a payment seems stuck.",
      ],
      notification: [
        "HustleX sends notifications for important events: new proposals, contract updates, project approvals, messages, and payment releases. Manage your notification preferences in Account Settings > Notifications.",
        "You can receive both in-app and email notifications. To customize: Go to Account Settings > Notifications and toggle which events you want to be notified about.",
      ],
      patterns: [
        { keywords: ["what", "tell me", "explain", "about", "info"], topic: "platform" },
        { keywords: ["post", "create", "add", "list", "job", "project"], topic: "job" },
        { keywords: ["find", "search", "browse", "discover", "freelancer", "talent"], topic: "freelancer" },
        { keywords: ["sign up", "register", "join", "account", "signup"], topic: "signup" },
        { keywords: ["apply", "application", "bid", "proposal", "proposals"], topic: "apply" },
        { keywords: ["feature", "what can", "capability", "offer"], topic: "feature" },
        { keywords: ["price", "cost", "fee", "pay", "pricing"], topic: "price" },
        { keywords: ["contact", "support", "help", "reach", "email"], topic: "contact" },
        { keywords: ["contract", "contracts", "agreement", "hire", "hiring"], topic: "contract" },
        { keywords: ["milestone", "milestones", "phase", "deliverable"], topic: "milestone" },
        { keywords: ["payment", "payments", "transaction", "withdraw"], topic: "payment" },
        { keywords: ["profile", "bio", "photo", "skills", "verification", "badge"], topic: "profile" },
        { keywords: ["rating", "ratings", "review", "reviews", "stars", "feedback"], topic: "rating" },
        { keywords: ["bidding", "strategy", "strategies", "competitive", "win"], topic: "bid" },
        { keywords: ["portfolio", "work sample", "showcase", "samples"], topic: "portfolio" },
        { keywords: ["dispute", "complaint", "issue", "problem", "conflict", "resolution"], topic: "dispute" },
        { keywords: ["dashboard", "analytics", "statistics", "metrics", "earnings"], topic: "dashboard" },
        { keywords: ["login", "password", "forgot", "reset", "can't sign in", "locked out"], topic: "troubleshoot" },
        { keywords: ["notification", "notify", "alert", "email notification"], topic: "notification" },
      ],
      thankYou: "You're welcome! 😊 Feel free to ask if you need any more help with HustleX!",
      greeting: "Hello! 👋 Welcome to HustleX! I'm HustleX AI, your intelligent assistant. I can help you with posting jobs, finding freelancers, payments, profile optimization, bidding strategies, and much more. What would you like to know?",
      unrelated: [
        `I appreciate your question! 😊 I'm HustleX AI, specialized in helping with our freelancing platform. While I'd love to chat about that, I'm best at answering questions about HustleX - like contracts, payments, profiles, bidding, and more. Is there anything about HustleX I can help you with today?`,
        `That's an interesting topic! While I'm here specifically to help with HustleX, I'd be happy to assist you with questions about our platform. You can ask me about posting jobs, finding freelancers, contracts, payments, profiles, or any other HustleX features. What would you like to know? 😊`,
        `Thanks for your question! I'm HustleX AI, so I'm optimized to help with our freelancing platform. I'd be delighted to help you with anything related to HustleX - from job posting to freelancer discovery, contracts, payments, and more. How can I assist you with HustleX today? 🤖`,
      ],
      default: `I understand you're asking about "${message}". While I'm optimized to help with HustleX platform questions, I can assist you with:\n\n• **Platform Information**: What HustleX is and how it works\n• **Job Posting**: How to create and manage job listings\n• **Finding Freelancers**: Discover and connect with talent\n• **Getting Started**: Sign up and account setup\n• **Applications & Proposals**: How to apply for jobs and write proposals\n• **Contracts & Milestones**: Creating contracts and managing project phases\n• **Payments**: Escrow protection, transactions, and withdrawals\n• **Profile & Portfolio**: Optimize your profile and showcase your work\n• **Ratings & Reviews**: How the review system works\n• **Bidding Strategies**: Win more projects with better proposals\n• **Dashboard & Analytics**: Track your activity and earnings\n• **Disputes**: Resolution process and support\n• **Notifications**: Manage your alerts and preferences\n\nCould you rephrase your question or ask about one of these topics? I'm here to help! 🤖`
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
        { keywords: ["መለጠፍ", "መፍጠር", "ስራ ለመለጠፍ", "ማሰራት", "ስራ ለጥፍ", "ስራ", "ፕሮጀክት"], topic: "job" },
        { keywords: ["ሰራተኛ", "ነጻ ሰራተኛ", "ፍሪላንሰር", "ባለሙያ", "ማግኘት", "መፈለግ"], topic: "freelancer" },
        { keywords: ["መመዝገብ", "መመዝገቢያ", "መቀላቀል", "ሳይን", "አካውንት"], topic: "signup" },
        { keywords: ["ማመልከት", "ማመልከቻ", "መወዳደር", "አመልክት", "ቢድ", "ፕሮፖዛል"], topic: "apply" },
        { keywords: ["አገልግሎት", "ፊውቸር", "ጥቅም", "ማድረግ"], topic: "feature" },
        { keywords: ["ዋጋ", "ክፍያ", "ገንዘብ", "ዋጋው", "ክፍያዎች"], topic: "price" },
        { keywords: ["እውቂያ", "ማግኘት", "ድጋፍ", "እርዳታ", "ስልክ", "ኢሜይል"], topic: "contact" },
        { keywords: ["ኮንትራት", "ውል", "ስምምነት", "ቅጥር", "መቅጠር"], topic: "contract" },
        { keywords: ["ደረጃ", "ማይልስቶን", "ክፍል", "ተላላፊ"], topic: "milestone" },
        { keywords: ["ክፍያ", "ክፍያዎች", "ኤስክሮው", "ግብይት", "ማውጣት"], topic: "payment" },
        { keywords: ["ፕሮፋይል", "ባዮ", "ፎቶ", "ክህሎት", "ማረጋገጫ", "ባጅ"], topic: "profile" },
        { keywords: ["ደረጃ አሰጣጥ", "ግምገማ", "ኮከብ", "አስተያየት"], topic: "rating" },
        { keywords: ["ቢድ", "ስትራቴጂ", "ውድድር", "ማሸነፍ"], topic: "bid" },
        { keywords: ["ፖርትፎሊዮ", "የስራ ናሙና", "ማሳያ"], topic: "portfolio" },
        { keywords: ["ክርክር", "ቅሬታ", "ችግር", "ግጭት", "መፍትሄ"], topic: "dispute" },
        { keywords: ["ዳሽቦርድ", "ትንተና", "ስታቲስቲክስ", "ገቢ"], topic: "dashboard" },
        { keywords: ["መግቢያ", "የይለፍ ቃል", "ረሳሁ", "ዳግም ማስጀመር", "ተቆልፏል"], topic: "troubleshoot" },
        { keywords: ["ማሳወቂያ", "ማስጠንቀቂያ", "ሳንቃ"], topic: "notification" },
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
        { keywords: ["baasuu", "uumuu", "hojii baasuuf", "hojjachiisuu", "maxxansuu", "pierojeektii"], topic: "job" },
        { keywords: ["hojjataa", "ogeessa", "ogeeyyii", "freelancer", "barbaaduu", "argachuu"], topic: "freelancer" },
        { keywords: ["galmaa'uu", "galmeessuu", "seenuu", "akaawuntii", "saayin", "banuu"], topic: "signup" },
        { keywords: ["iyyachuu", "dorgomuu", "iyyata", "apply", "biid", "piroopozaalii"], topic: "apply" },
        { keywords: ["tajaajila", "amala", "amaloota", "faayidaa"], topic: "feature" },
        { keywords: ["gatii", "kaffaltii", "maallaqa", "gatiin"], topic: "price" },
        { keywords: ["qunnamuu", "argachuu", "gargaarsa", "bilbila", "email", "qunnamtii"], topic: "contact" },
        { keywords: ["koontrat", "waliigaltee", "qacarsii", "hojjechiisuu"], topic: "contract" },
        { keywords: ["sadarkaa", "maayilistoonii", "kutaa", "bu'aa"], topic: "milestone" },
        { keywords: ["kaffaltii", "kaffaltiiwwan", "iskiroo", "daddabarsaa", "baasuu"], topic: "payment" },
        { keywords: ["pirofaayilii", "baayoo", "suuraa", "dandeettii", "mirkaneessuu", "baajjii"], topic: "profile" },
        { keywords: ["sadarkaa kennuun", "gamaaggama", "urjii", "yaada"], topic: "rating" },
        { keywords: ["biid", "tarsiimoo", "dorgommii", "mo'achuu"], topic: "bid" },
        { keywords: ["pirotofolioo", "fakkeenyummaa hojii", "agarsiisa"], topic: "portfolio" },
        { keywords: ["falmii", "iyyata", "rakkoo", "wal-dhabdee", "furmaata"], topic: "dispute" },
        { keywords: ["daashboordii", "xiinxala", "istaatistiiksii", "galii"], topic: "dashboard" },
        { keywords: ["seensa", "jecha iccitii", "irraanfadhe", "haaromsuu", "cufameera"], topic: "troubleshoot" },
        { keywords: ["beeksisa", "of-eeggannoo", "akeekkachiisa"], topic: "notification" },
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
        { keywords: ["ምልጣፍ", "ምፍጣር", "ስራሕ ንምልጣፍ", "ምቑጻር", "ስራሕ ለጥፍ", "ስራሕ", "ፕሮጀክት"], topic: "job" },
        { keywords: ["ሰራሕተኛ", "ነጻ ሰራሕተኛ", "ፍሪላንሰር", "ክኢላ", "ምርካብ", "ምድላይ"], topic: "freelancer" },
        { keywords: ["ምምዝጋብ", "ምምዝጋብ", "ምእታው", "ሳይን", "ኣካውንት"], topic: "signup" },
        { keywords: ["ማመልከት", "ማመልከቻ", "ምወዳደር", "ኣመልክት", "ቢድ", "ፕሮፖዛል"], topic: "apply" },
        { keywords: ["ኣገልግሎት", "ፊውቸር", "ጥቕሚ", "ምግባር"], topic: "feature" },
        { keywords: ["ዋጋ", "ክፍሊት", "ገንዘብ", "ዋጋታት", "ክፍሊታት"], topic: "price" },
        { keywords: ["ምርካብ", "ሓገዝ", "ድጋፍ", "ስልኪ", "ኢሜይል", "ርኸቡና"], topic: "contact" },
        { keywords: ["ኮንትራት", "ስምምዕ", "ምቑጻር", "ምቑጽጻር"], topic: "contract" },
        { keywords: ["ደረጃ", "ማይልስቶን", "ክፋል", "ውጽኢት"], topic: "milestone" },
        { keywords: ["ክፍሊት", "ክፍሊታት", "ኤስክሮው", "ልውውጥ", "ምውጻእ"], topic: "payment" },
        { keywords: ["ፕሮፋይል", "ባዮ", "ስእሊ", "ክእለት", "ምርግጋጽ", "ባጅ"], topic: "profile" },
        { keywords: ["ደረጃ ምሃብ", "ገምጋም", "ኮኾብ", "ርእይቶ"], topic: "rating" },
        { keywords: ["ቢድ", "ስትራተጂ", "ውድድር", "ምዕዋት"], topic: "bid" },
        { keywords: ["ፖርትፎሊዮ", "ናሙና ስራሕ", "ምርኢት"], topic: "portfolio" },
        { keywords: ["ክርክር", "ጥርዓን", "ጸገም", "ግጭት", "ፍታሕ"], topic: "dispute" },
        { keywords: ["ዳሽቦርድ", "ትንተና", "ስታቲስቲክስ", "ኣታዊ"], topic: "dashboard" },
        { keywords: ["ምእታው", "ቃል ምስጢር", "ረሲዐ", "ዳግም ምጅማር", "ተዓጽዩ"], topic: "troubleshoot" },
        { keywords: ["መተሓሳሰቢ", "ማሕበራዊ", "ኣጠንቀቕታ"], topic: "notification" },
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
