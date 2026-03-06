import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import axios from "axios";
import { getBackendApiUrlSync } from "../utils/portDetector";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const FloatingChatBot: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get initial greeting based on language
  const getInitialGreeting = () => {
    return t.chatBot?.greeting || "Hello! 👋 I'm HustleX Assistant. I can help you learn about our platform, find freelancers, post jobs, and answer any questions you have. How can I assist you today?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: getInitialGreeting(),
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  // Update initial greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === "bot") {
      setMessages([
        {
          id: "1",
          text: getInitialGreeting(),
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [language, t]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get API base URL
  const getApiBaseUrl = () => {
    if (window.location.hostname.includes("devtunnels")) {
      return `https://${window.location.hostname}/api`;
    }
    // Use dynamic port detection
    return getBackendApiUrlSync();
  };

  // Call AI API with conversation history
  const callChatbotAPI = async (message: string): Promise<string> => {
    try {
      const conversationHistory = messages
        .slice(1) // Skip the initial greeting
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      const response = await axios.post(
        `${getApiBaseUrl()}/chatbot/chat`,
        {
          message,
          conversationHistory,
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      return (response.data as any).response || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error("Chatbot API Error:", error);

      // Fallback to intelligent local response
      return generateFallbackResponse(message);
    }
  };

  // Fallback response generator
  const generateFallbackResponse = (question: string): string => {
    const normalized = question.toLowerCase().trim();

    // Knowledge base for different languages
    const knowledgeBase: Record<string, {
      answers: Record<string, string>,
      patterns: { keywords: string[], topic: string }[],
      defaultGreeting: string,
      thankYou: string,
      unrelated: string[]
    }> = {
      en: {
        answers: {
          platform: "HustleX is a freelancing platform connecting talented freelancers with clients. It offers job posting, freelancer discovery, messaging, video calls, and secure payments.",
          job: "To post a job: Go to 'Post a Job', enter job title, description, budget, requirements, and submit. Your job will be visible to freelancers who can apply.",
          freelancer: "Find freelancers by browsing the directory, using search filters (skills, experience, location), or posting a job and reviewing applications from interested professionals.",
          signup: "Sign up by clicking 'Sign Up', choose your role (Freelancer or Client), provide your email and details, and complete registration to start using HustleX.",
          apply: "Apply for jobs by browsing listings, clicking on a job that interests you, reviewing requirements, and clicking the 'Apply' button with your portfolio and cover letter.",
          feature: "HustleX features include: job posting and management, freelancer search with filters, real-time messaging, video calls, file attachments, application tracking, secure payments, and comprehensive profiles.",
          price: "HustleX offers flexible pricing. Contact us or visit our pricing page for detailed information about subscription plans and transaction fees.",
          contact: "Contact us through the Contact Us page, email support, or use our help center. We're here to assist you with any questions!",
        },
        patterns: [
          { keywords: ["hustlex", "platform", "website", "what is"], topic: "platform" },
          { keywords: ["post", "create", "job", "work", "hire"], topic: "job" },
          { keywords: ["find", "search", "freelancer", "talent", "worker"], topic: "freelancer" },
          { keywords: ["sign", "register", "join", "account", "login"], topic: "signup" },
          { keywords: ["apply", "bid", "proposal"], topic: "apply" },
          { keywords: ["feature", "video", "chat", "call"], topic: "feature" },
          { keywords: ["price", "cost", "fee", "pay", "payment"], topic: "price" },
          { keywords: ["contact", "support", "help", "email", "phone"], topic: "contact" },
        ],
        defaultGreeting: "Hello! 👋 Welcome to HustleX! cannot understand? try simplified english.",
        thankYou: "You're welcome! 😊 Feel free to ask if you need any more help with HustleX!",
        unrelated: [
          "I appreciate your question! 😊 I'm HustleX Assistant, specialized in helping with our freelancing platform. Is there anything about HustleX I can help you with today?",
          "That's an interesting topic! While I'm here specifically to help with HustleX, I'd be happy to assist you with questions about our platform.",
          "Thanks for your question! I'm HustleX Assistant, so I'm optimized to help with our freelancing platform. How can I assist you with HustleX today? 🤖"
        ]
      },
      am: {
        answers: {
          platform: "HustleX ታላላቅ የኢትዮጵያ ነጻ ሰራተኞችን ከደንበኞች ጋር የሚያገናኝ መድረክ ነው። ስራ መለጠፍ፣ ሰራተኛ መፈለግ፣ መልእክት መላክ እና ደህንነቱ የተጠበቀ ክፍያ ያካተተ ነው።",
          job: "ስራ ለመለጠፍ፡ 'ስራ ለጥፍ' የሚለውን ይጫኑ፣ የስራውን ርዕስ፣ መግለጫ፣ በጀት እና የሚያስፈልጉ ክህሎቶችን ያስገቡ።",
          freelancer: "ነጻ ሰራተኞችን ለማግኘት፡ ዝርዝሩን ያስሱ፣ ማጣሪያዎችን (ክህሎት፣ ልምድ፣ ቦታ) ይጠቀሙ ወይም ስራ ይለጥፉ።",
          signup: "ለመመዝገብ፡ 'ተመዝግብ'ን ይጫኑ፣ እንደ ነጻ ሰራተኛ ወይም ደንበኛ ይምረጡ፣ ኢሜይል እና ዝርዝር መረጃዎን ያስገቡ።",
          apply: "ለስራ ለማመልከት፡ የስራ ዝርዝሮችን ያስሱ፣ የሚፈልጉትን ስራ ይጫኑ፣ መስፈርቶችን ይገምግሙ እና 'አመልክት' የሚለውን ይጫኑ።",
          feature: "የHustleX አገልግሎቶች፡ ስራ መለጠፍ፣ ሰራተኛ መፈለግ፣ የቀጥታ መልእክት፣ የቪዲዮ ጥሪ እና ደህንነቱ የተጠበቀ ክፍያ ናቸው።",
          price: "HustleX ተመጣጣኝ ዋጋዎችን ያቀርባል። ለበለጠ መረጃ የዋጋ ገጻችንን ይጎብኙ ወይም ያግኙን።",
          contact: "በ'ያግኙን' ገጽ፣ በኢሜይል ወይም በእርዳታ ማዕከላችን በኩል ያግኙን። በማንኛውም ሰዓት ልንረዳዎ ዝግጁ ነን!",
        },
        patterns: [
          { keywords: ["hustlex", "ፕላትፎርም", "መድረክ", "ምንድን", "ስለ", "ዌብሳይት"], topic: "platform" },
          { keywords: ["ስራ", "መለጠፍ", "መፍጠር", "ቀጣሪ", "ማሰራት"], topic: "job" },
          { keywords: ["መፈለግ", "ሰራተኛ", "ፍሪላንሰር", "ባለሙያ", "ሰው"], topic: "freelancer" },
          { keywords: ["መመዝገብ", "መቀላቀል", "አካውንት", "ሎግኢን", "ሳይን"], topic: "signup" },
          { keywords: ["ማመልከት", "መወዳደር", "ፕሮፖዛል"], topic: "apply" },
          { keywords: ["አገልግሎት", "ፊውቸር", "ቪዲዮ", "ቻት"], topic: "feature" },
          { keywords: ["ዋጋ", "ክፍያ", "ገንዘብ", "ኮሚሽን"], topic: "price" },
          { keywords: ["ማግኘት", "ድጋፍ", "እርዳታ", "ስልክ", "ኢሜይል"], topic: "contact" },
        ],
        defaultGreeting: "ሰላም! 👋 ወደ HustleX እንኳን በደህና መጡ! ስለ መድረኩ ማንኛውንም ጥያቄ ሊጠይቁኝ ይችላሉ።",
        thankYou: "ምንም አይደል! 😊 ሌላ ጥያቄ ካለዎት ይጠይቁ።",
        unrelated: [
          "ጥያቄዎ ጥሩ ነው! 😊 እኔ የHustleX ረዳት ስለሆንኩ፣ ስለ መድረኩ ጥያቄዎች ቢጠይቁኝ የተሻለ መረጃ መስጠት እችላለሁ።",
          "ይቅርታ፣ እኔ ስለ HustleX ብቻ ነው መረጃ መስጠት የምችለው። ስለ ስራ መለጠፍ ወይም ሰራተኛ መፈለግ ልንገሮት? 🤖"
        ]
      },
      om: {
        answers: {
          platform: "HustleX'n plaatformii hojii bilisaa Itoophiyaa isa cimaadha. Hojjattoota ogummaa qaban daldaltoota waliin wal-qunnamsiisa.",
          job: "Hojii baasuuf: Gara 'Hojii Baasi' deemaa, mata-duree hojii, ibsa, baajeta fi ogummaa barbaachisu galchaa.",
          freelancer: "Hojjattoota bilisaa argachuuf: Tarreeffama ilaalaa, filannoo (skills, experience) fayyadamaa ykn hojii baasaa.",
          signup: "Galmaa'uuf: 'Galmaa'i' filadhaa, akka hojjataa bilisaa ykn daldalaatti filadhaa, email fi odeeffannoo guutaa.",
          apply: "Hojiif iyyachuuf: Hojiiwwan ilaalaa, kan isinitti tole filadhaa, ulaagaalee ilaalaa fi 'Apply' cuqaasaa.",
          feature: "Amaloota HustleX: Hojii baasuu, hojjataa barbaaduu, ergaa kallattii, waamicha viidiyoo fi kaffaltii amansiisaa.",
          price: "HustleX gatii madaalawaa qaba. Odeeffannoo dabalataaf fuula gatii keenyaa daawwadhaa.",
          contact: "Fuula 'Nu Qunnamsiisa' jedhuun, email ykn maallaqa gargaarsaa keenyaan nu qunnamaa.",
        },
        patterns: [
          { keywords: ["hustlex", "plaatformii", "waa'ee", "maali"], topic: "platform" },
          { keywords: ["hojii", "baasuu", "uumuu", "hojjachiisuu"], topic: "job" },
          { keywords: ["barbaaduu", "hojjataa", "ogeessa", "nama"], topic: "freelancer" },
          { keywords: ["galmaa'uu", "banuu", "akkaawuntii", "seenuu"], topic: "signup" },
          { keywords: ["iyyachuu", "dorgomuu"], topic: "apply" },
          { keywords: ["amala", "tajaajila", "viidiyoo", "haasaa"], topic: "feature" },
          { keywords: ["gatii", "kaffaltii", "maallaqa"], topic: "price" },
          { keywords: ["qunnamuu", "gargaarsa", "bilbila", "email"], topic: "contact" },
        ],
        defaultGreeting: "Akkam! 👋 Baga nagaan gara HustleX dhuftan! Ani gargaaraa keessani, maal isin gargaaru?",
        thankYou: "Galatoomaa! 😊 Gaaffii biraa yoo qabaattan na gaafadhaa.",
        unrelated: [
          "Gaaffii gaarii dha! 😊 Ani garuu gargaaraa HustleX waan ta'eef, waa'ee hojii fi plaatformii keenyaa qofa deebisuu danda'a.",
          "Dhiifama, ani waa'ee HustleX qofan beeka. Waa'ee hojii baasuu ykn hojjataa barbaaduu isinitti himuu? 🤖"
        ]
      },
      ti: {
        answers: {
          platform: "HustleX ላዕለዎት ናይ ኢትዮጵያ ነጻ ሰራሕተኛታት ምስ ዓማዊል ዘራኽብ መድረኽ እዩ። ስራሕ ምልጣፍ፣ ሰራሕተኛ ምድላይ ይከኣል።",
          job: "ስራሕ ንምልጣፍ፡ 'ስራሕ ለጥፍ' ዝብል ምረጽ፣ ኣርእስቲ ስራሕ፣ መግለጺ፣ ባጀት ኣእቱ።",
          freelancer: "ነጻ ሰራሕተኛታት ንምርካብ፡ ዝርዝር ድለይ፣ ማጣሪያ ተጠቐም ወይ ስራሕ ለጥፍ።",
          signup: "ንምምዝጋብ፡ 'ተመዝገብ' ምረጽ፣ ከም ነጻ ሰራሕተኛ ወይ ዓሚል ምረጽ፣ ኢሜይልን ሓበሬታን ኣእቱ።",
          apply: "ንስራሕ ንምምልካት፡ ዝርዝር ስራሕቲ ርኣይ፣ ዝደለኻዮ ስራሕ ምረጽ፣ ን'ኣመልክት' ጠውቕ።",
          feature: "ናይ HustleX ኣገልግሎታት፡ ስራሕ ምልጣፍ፣ ሰራሕተኛ ምድላይ፣ ቀጥታ መልእኽቲ፣ ቪድዮ ጻውዒት።",
          price: "HustleX ተመጣጣኒ ዋጋ የቅርብ። ንተወሳኺ ሓበሬታ ገጽ ዋጋና ተወከሱ።",
          contact: "ብ'ርኸብና' ገጽ፣ ብኢሜይል ወይ ብማእከል ሓገዝና ርኸቡና።",
        },
        patterns: [
          { keywords: ["hustlex", "መድረኽ", "እንታይ", "ብዛዕባ"], topic: "platform" },
          { keywords: ["ስራሕ", "ምልጣፍ", "ምፍጣር", "ዓሚል"], topic: "job" },
          { keywords: ["ምድላይ", "ሰራሕተኛ", "ፍሪላንሰር", "ክኢላ"], topic: "freelancer" },
          { keywords: ["ምምዝጋብ", "ምእታው", "ኣካውንት"], topic: "signup" },
          { keywords: ["ምምልካት", "ምወዳደር"], topic: "apply" },
          { keywords: ["ኣገልግሎት", "ቪዲዮ", "መልእኽቲ"], topic: "feature" },
          { keywords: ["ዋጋ", "ክፍሊት"], topic: "price" },
          { keywords: ["ምርካብ", "ሓገዝ", "ስልኪ"], topic: "contact" },
        ],
        defaultGreeting: "ሰላም! 👋 ናብ HustleX ብደሓን መጻእኩም! ብዛዕባ መድረኽ ዝኾነ ሕቶ ክትሓቱኒ ትኽእሉ ኢኹም።",
        thankYou: "ብምንም! 😊 ካልእ ሕቶ እንተለኩም ሕተቱ።",
        unrelated: [
          "ጽቡቕ ሕቶ! 😊 ኣነ ናይ HustleX ሓጋዚ ስለዝኾንኩ፣ ብዛዕባ መድረኽ ሕቶታት እንተሓቲትኩምኒ ይምረጽ።",
          "ይቕሬታ፣ ኣነ ብዛዕባ HustleX ጥራይ እየ ሓበሬታ ክህብ ዝኽእል።"
        ]
      }
    };

    // Use current language or default to English
    const currentLangConfig = knowledgeBase[language] || knowledgeBase["en"];

    // Check if user is saying thank you
    const thankYouKeywords = ["thank", "thanks", "appreciate", "አመሰግናለሁ", "galatoomaa", "የቀንየለይ"];
    if (thankYouKeywords.some(kw => normalized.includes(kw))) {
      return currentLangConfig.thankYou;
    }

    // Check patterns for the specific language
    for (const pattern of currentLangConfig.patterns) {
      if (pattern.keywords.some((kw) => normalized.includes(kw))) {
        return currentLangConfig.answers[pattern.topic];
      }
    }

    // If no specific match, check if it looks like a greeting
    const greetings = ["hi", "hello", "hey", "ሰላም", "akkam", "selam"];
    if (greetings.some(kw => normalized.includes(kw))) {
      return currentLangConfig.defaultGreeting;
    }

    // Default unrelated response
    return currentLangConfig.unrelated[Math.floor(Math.random() * currentLangConfig.unrelated.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const messageText = inputValue.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setIsLoading(true);
    setError(null);

    try {
      // Call AI API
      const botResponseText = await callChatbotAPI(messageText);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("Failed to get response. Please try again.");

      // Fallback response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateFallbackResponse(messageText),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center ${darkMode
          ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
          : "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
          }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { scale: 0 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <MessageCircle className="w-6 h-6" />
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
              } rounded-2xl shadow-2xl overflow-hidden ${darkMode
                ? "bg-gray-900 border-2 border-cyan-500/30"
                : "bg-white border-2 border-cyan-200"
              }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${darkMode ? "border-cyan-500/30 bg-gray-800" : "border-cyan-200 bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`p-2 rounded-full ${darkMode
                    ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                    : "bg-gradient-to-br from-cyan-100 to-blue-100"
                    }`}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Bot className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                </motion.div>
                <div>
                  <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    HustleX Assistant
                  </h3>
                  <p className={`text-xs flex items-center gap-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {isTyping || isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t.chatBot?.thinking || "Thinking..."}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>{t.chatBot?.online || "Online"}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setIsMinimized(!isMinimized)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                >
                  {isMinimized ? (
                    <Maximize2 className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                  ) : (
                    <Minimize2 className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                >
                  <X className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <div
                className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar ${darkMode ? "bg-gray-900" : "bg-white"
                  }`}
                style={{ height: "calc(100% - 140px)" }}
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {message.sender === "bot" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode
                          ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                          : "bg-gradient-to-br from-cyan-100 to-blue-100"
                          }`}
                      >
                        <Bot className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.sender === "user"
                        ? darkMode
                          ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                          : "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                        : darkMode
                          ? "bg-gray-800 text-white border border-gray-700"
                          : "bg-gray-100 text-gray-900 border border-gray-200"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${message.sender === "user"
                          ? "text-cyan-100"
                          : darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                          }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode
                          ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                          : "bg-gradient-to-br from-cyan-100 to-blue-100"
                          }`}
                      >
                        <span className={`text-xs font-bold ${darkMode ? "text-cyan-300" : "text-cyan-700"}`}>
                          U
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {(isTyping || isLoading) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode
                        ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                        : "bg-gradient-to-br from-cyan-100 to-blue-100"
                        }`}
                    >
                      <Bot className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${darkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-gray-100 border border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className={`w-4 h-4 animate-spin ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                        <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {t.chatBot?.aiThinking || "AI is thinking..."}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs px-3 py-2 rounded-lg ${darkMode ? "bg-red-900/30 text-red-400 border border-red-800" : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                  >
                    {error}
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            {!isMinimized && (
              <div
                className={`p-4 border-t ${darkMode ? "border-cyan-500/30 bg-gray-800" : "border-cyan-200 bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t.chatBot?.placeholder || "Ask me anything..."}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm ${darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2.5 rounded-xl ${inputValue.trim() && !isLoading
                      ? darkMode
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : darkMode
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    whileHover={inputValue.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={inputValue.trim() && !isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatBot;
