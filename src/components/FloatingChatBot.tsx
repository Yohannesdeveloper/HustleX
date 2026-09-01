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
    return t.chatBot?.greeting || "Hello! 👋 I'm HustleX AI, your intelligent assistant. I can help you with posting jobs, finding freelancers, payments, profile optimization, bidding strategies, and much more. What would you like to know?";
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
          language,
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
      howAreYou?: string,
      unrelated: string[]
    }> = {
      en: {
        answers: {
          platform: "HustleX is Ethiopia's premier freelance platform connecting talented freelancers with clients worldwide. 🌍\n\n**What we offer:**\n• Job posting & project management\n• Freelancer discovery with advanced filters\n• Real-time messaging & video calls\n• Portfolio management\n• Skills verification & badges\n• Reviews & ratings system\n• Dashboard analytics\n• Blog & Help Center\n• Multilingual support (English, Amharic, Oromo, Tigrinya)\n\n🔗 Visit: hustleX.com | 📧 hustleXet@gmail.com | 📱 Telegram: @HustleXeth",
          findJobs: "**How to Find Jobs on HustleX:**\n\n1️⃣ **Sign up** as a Freelancer → /signup\n2️⃣ **Complete your profile** — skills, bio, photo, hourly rate\n3️⃣ **Browse Job Listings** → /job-listings\n4️⃣ **Filter** by category, budget, skills, deadline\n5️⃣ **Click a job** to view full details & requirements\n6️⃣ **Apply** with a tailored proposal + portfolio samples\n7️⃣ **Get hired!** Client selects you → contract created → start working\n\n💡 **Pro Tips:**\n• Complete your profile 100% for better visibility\n• Add portfolio samples relevant to the job\n• Write personalized proposals, not copy-paste\n• Set a competitive but fair hourly rate\n• Get skills badges verified to stand out",
          freelance: "**How to Start Freelancing on HustleX:**\n\n📋 **Step 1: Create Account**\n• Go to /signup → choose \"Freelancer\"\n• Verify your email\n\n📝 **Step 2: Complete Profile**\n• Professional photo (clear, well-lit)\n• Compelling bio (2-3 paragraphs about your expertise)\n• List all your skills\n• Set your hourly rate\n• Complete the profile setup wizard → /profile-setup\n\n🎨 **Step 3: Build Portfolio**\n• Upload your best work samples\n• Add descriptions, screenshots, links\n• Show variety of projects\n\n✅ **Step 4: Get Verified**\n• Take skills verification tests\n• Earn badges that appear on your profile\n\n🔍 **Step 5: Find & Apply to Jobs**\n• Browse /job-listings daily\n• Apply to jobs matching your skills\n• Write personalized proposals\n\n⭐ **Step 6: Deliver & Get Rated**\n• Communicate regularly with clients\n• Submit work on time\n• Get 5-star ratings → more visibility → more jobs!\n\n🚀 The more complete your profile, the more clients see you!",
          postJob: "**How to Post a Job on HustleX:**\n\n1️⃣ **Sign up** as a Client → /signup\n2️⃣ Click **'Post a Job'** → /post-job\n3️⃣ Fill in the details:\n   • **Title** — clear, specific (e.g., 'React Developer for E-commerce Site')\n   • **Description** — detailed project requirements\n   • **Skills** — required skills (e.g., React, Node.js, UI/UX)\n   • **Budget** — your price range\n   • **Deadline** — project timeline\n4️⃣ **Preview & Submit**\n5️⃣ **Receive proposals** from freelancers\n6️⃣ **Review & Hire** the best fit\n\n💡 **Plans:**\n• Free: 3 jobs (lifetime)\n• Basic (999 ETB/mo): 10 jobs/month + featured listings\n• Premium (9,999 ETB/mo): Unlimited + promoted + API\n\n✅ Your job becomes visible to ALL matching freelancers immediately!",
          freelancer: "**Finding Freelancers on HustleX:**\n\n🔍 **Method 1: Browse Directory**\n• Search by skills, experience, location, ratings\n• View detailed profiles and portfolios\n\n📋 **Method 2: Post a Job**\n• Post your project → freelancers apply with proposals\n• Compare cover letters, portfolios, and proposed budgets\n• Select the best match for your project\n\n💡 **Tips for Choosing:**\n• Check their portfolio samples\n• Read reviews from previous clients\n• Look at their skills badges (verified = trusted)\n• Review their proposed timeline and budget\n• Message them before hiring to discuss details",
          signup: "**Creating Your HustleX Account:**\n\n1️⃣ Go to /signup\n2️⃣ Choose your role:\n   • **Freelancer** — if you want to find work\n   • **Client** — if you want to hire\n3️⃣ Fill in your details:\n   • Full name\n   • Email address\n   • Password (strong, 8+ characters)\n4️⃣ Verify your email (check inbox + spam)\n5️⃣ Complete your profile wizard\n\n💡 **It's completely FREE to get started!**\n• No credit card required\n• Browse jobs immediately after signup\n• Upgrade anytime for more features",
          apply: "**How to Apply for Jobs:**\n\n1️⃣ Go to **Job Listings** → /job-listings\n2️⃣ Browse and filter by your skills\n3️⃣ Click a job to view full details\n4️⃣ Click **'Apply'** button\n5️⃣ Write your proposal:\n   • Personalized greeting\n   • Show you understand the project\n   • Explain your approach\n   • Mention relevant experience\n   • Include portfolio samples\n   • Set your proposed budget/timeline\n6️⃣ Submit and wait for client response\n\n💡 **Proposal Tips:**\n• NEVER copy-paste generic proposals\n• Reference specific project details\n• Keep it professional but friendly\n• Highlight 2-3 relevant portfolio items\n• Be realistic with your pricing",
          feature: "**HustleX Complete Feature List:**\n\n📋 **For Clients:**\n• Post & manage jobs\n• Browse freelancer directory\n• Review proposals & portfolios\n• Track project progress\n\n💼 **For Freelancers:**\n• Complete profile builder\n• Portfolio management\n• Skills verification & badges\n• Browse & apply to jobs\n• Application tracking dashboard\n\n💬 **Communication:**\n• Real-time messaging (Socket.IO)\n• Video calls\n• File sharing\n• Notifications (in-app + email)\n\n💰 **Payments:**\n• Telebirr, CBE Birr, Awash Bank\n\n🌐 **Other:**\n• Blog with articles & tips\n• Help Center\n• FAQ page\n• Dark mode\n• Multilingual (EN, AM, OM, TI)\n• Admin panel",
          price: "**HustleX Pricing Plans:**\n\n🆓 **Free Plan (0 ETB — Forever)**\n• Post up to 3 jobs (lifetime)\n• Multi-platform posting\n• Browse freelancer profiles\n• Basic messaging\n• Standard support\n• Access to job listings\n\n⭐ **Basic Plan (999 ETB/month)**\n• Post up to 10 jobs per month\n• Unlimited freelancer browsing\n• Priority messaging\n• Priority support\n• Advanced search filters\n• Job analytics dashboard\n• Featured job listings\n\n💎 **Premium Plan (9,999 ETB/month)**\n• Unlimited job posts\n• Unlimited freelancer access\n• Premium messaging with video calls\n• Dedicated support\n• Advanced analytics & insights\n• Featured/promoted listings\n• Custom branding options\n• API access\n• Dedicated account manager\n• Early access to new features\n\n🔗 View full details: /pricing",
          contact: "**Contact HustleX:**\n\n📞 **Phone:** +251 942927999 (Mon-Fri 9AM-6PM EAT)\n📧 **Email:** hustleXet@gmail.com (response within 24 hours)\n📱 **Telegram:** @HustleXeth\n🌐 **Website:** hustleX.com\n📋 **Contact Form:** /contact-us\n\n🏢 **Office:**\nHustleX HQ\nAddis Ababa, Ethiopia\nLocated in the heart of Addis Ababa's business district\n\n🕐 **Business Hours:**\n• Mon - Fri: 9AM - 6PM (EAT)\n• Weekend support available\n\n❓ **Other Resources:**\n• Help Center: /help-center\n• FAQ: /faq\n\nWe're here to help you succeed! 💪",
          contract: "**Contracts on HustleX:**\n\n📄 **What is a contract?**\nA formal agreement between a client and freelancer that defines:\n• Scope of work\n• Total budget\n• Deadlines\n\n✅ **How to create:**\n1. Client selects freelancer's proposal\n2. Clicks \"Hire\"\n3. Sets up deliverables & payment terms\n4. Freelancer accepts\n5. Work begins!\n\n🛡️ **Protection:**\n• Both parties can raise disputes\n• Contract dashboard tracks everything",
          milestone: "**Project Management on HustleX:**\n\n🎯 **Managing Projects:**\nBreak your project into manageable phases. Each has:\n• Clear deliverables\n• An agreed payment amount\n• A deadline\n\n📋 **Example (Web Development Project):**\n1. **Design Mockups** — 5,000 ETB — Due Week 1\n2. **Frontend Development** — 10,000 ETB — Due Week 3\n3. **Backend & Testing** — 10,000 ETB — Due Week 5\n4. **Deployment & Handover** — 5,000 ETB — Due Week 6\n\n💰 **How payments work:**\n• Client and freelancer agree on payment terms\n• Freelancer delivers work\n• Client reviews and approves\n• Payment processed\n• Both leave ratings",
          payment: "**Payments on HustleX:**\n\n💳 **Accepted Methods:**\n• **Telebirr** — Ethiopian mobile money\n• **CBE Birr** — Commercial Bank of Ethiopia\n• **Awash Bank** — Mobile banking\n\n💰 **How Payments Work:**\n1. Client and freelancer agree on payment terms\n2. Freelancer delivers the work\n3. Client reviews and approves\n4. Payment is processed\n\n❓ **Common Questions:**\n• *When do I get paid?* — After client approves your work\n• *What if there's a dispute?* — Raise dispute → our team reviews within 48hrs\n\n📊 Check your payments: Dashboard > Payments",
          profile: "**Your HustleX Profile:**\n\n📸 **Must Complete:**\n• **Photo** — Professional, clear headshot\n• **Bio** — 2-3 paragraphs about your expertise\n• **Skills** — List all your skills (get verified!)\n• **Hourly Rate** — Set competitive pricing (freelancers)\n• **Portfolio** — Upload 3-5 work samples\n• **Email Verification** — Check inbox + spam\n\n🎯 **Profile Setup Pages:**\n• General: /profile-setup\n• Freelancer: /freelancer-profile-setup\n• Company: /company-profile\n\n💡 **Tips for a Great Profile:**\n• Use a real photo (not avatar/logo)\n• Write in first person\n• Highlight achievements with numbers\n• Get skills verified for badges\n• Add testimonials from past clients",
          rating: "**Ratings & Reviews on HustleX:**\n\n⭐ **How it works:**\n• After project completion, BOTH parties can leave ratings\n• 1-5 star scale with written reviews\n• Reviews are permanent and visible on profiles\n\n📈 **Why ratings matter:**\n• High ratings → more visibility in search\n• Clients trust highly-rated freelancers\n• Freelancers prefer well-reviewed clients\n• Good track record = better opportunities\n\n💡 **Get great ratings:**\n• Communicate regularly\n• Deliver on time (or early!)\n• Exceed expectations\n• Be professional and responsive\n• Ask for the review after successful delivery",
          troubleshoot: "**Troubleshooting Guide:**\n\n🔐 **Can't Login?**\n• Check email/password spelling\n• Use Forgot Password → /forgot-password\n• Verify your email (check inbox + spam)\n• Clear browser cache or try incognito\n• Make sure JavaScript is enabled\n\n💳 **Payment Issues?**\n• Check Dashboard > Payments for history\n• Verify your payment method is valid\n• Payments released after approval\n• Contact support if stuck for 48+ hours\n\n📝 **Can't Apply to Jobs?**\n• Complete your profile first (required)\n• Go to /profile-setup\n• Make sure email is verified\n\n🎨 **Profile Problems?**\n• Images: JPG or PNG only\n• Documents: PDF only\n• Fill ALL required fields\n• Try different browser if upload fails",
          darkMode: "**Dark Mode on HustleX:**\n\n🌙 **How to toggle:**\n• Click the **moon/sun icon** in the navbar (top-right)\n• Or go to Account Settings → /account-settings\n\n💡 Dark mode works on all pages and is saved to your browser!",
          blog: "**HustleX Blog:**\n\n📰 **Read articles** at /blog\n• Freelancing tips & guides\n• Industry news\n• Success stories\n• Platform updates\n\n✍️ **Write articles** (if you have blog access):\n• /blog/post — Create new articles\n• /admin/blog — Manage blog posts\n\n📖 Read individual posts: /blog/:id",
          dashboard: "**HustleX Dashboards:**\n\n📊 **Client Dashboard** → /dashboard/hiring\n• Your posted jobs\n• Applications received\n• Hired freelancers\n• Active contracts\n• Project progress tracking\n\n💼 **Freelancer Dashboard** → /dashboard/freelancer\n• Your earnings overview\n• Active applications\n• Current contracts\n• Profile views\n• Rating summary\n\n📱 **Applications** → /applications-management\n• Track all your job applications\n• See status (pending, accepted, rejected)",
          messaging: "**Messaging on HustleX:**\n\n💬 **Real-time Chat:**\n• Go to /chat to access messaging\n• Built on Socket.IO for instant delivery\n• Send text messages\n• Share files and documents\n• Video call support (Premium plan)\n\n🔔 **Notifications:**\n• In-app notifications for new messages\n• Email notifications (can be toggled in Account Settings)\n\n💡 **Tips:**\n• Respond promptly — clients notice!\n• Be professional and clear\n• Use file sharing for specs/designs",
          dispute: "**Dispute Resolution on HustleX:**\n\n⚠️ **How to raise a dispute:**\n1. Go to the contract page\n2. Click \"Raise Dispute\"\n3. Describe the issue with evidence\n4. Our team reviews within 48 hours\n\n📋 **Common dispute reasons:**\n• Work not delivered as agreed\n• Client not responding\n• Quality doesn't match requirements\n• Scope creep issues\n\n🛡️ **Resolution:**\n• Both parties present their case\n• Fair resolution based on evidence\n• Contact support: hustleXet@gmail.com",
          search: "**Search & Filter on HustleX:**\n\n🔍 **Job Search** (/job-listings):\n• Filter by category/skills\n• Filter by budget range\n• Filter by deadline\n• Sort by newest, budget, or relevance\n\n👥 **Freelancer Search:**\n• Filter by skills\n• Filter by experience level\n• Filter by location\n• Filter by rating\n• Sort by rating, hourly rate\n\n💡 **Advanced filters** available on Basic & Premium plans!",
          editJob: "**Editing a Posted Job:**\n\n📝 Go to your Client Dashboard → /dashboard/hiring\n1. Find the job you want to edit\n2. Click the **Edit** button\n3. Update title, description, skills, budget, or deadline\n4. Save changes\n\n🔗 Direct link: /edit-job/:id\n\n💡 Note: Major edits may notify freelancers who already applied!",
          notifications: "**Managing Notifications:**\n\n🔔 **Types:**\n• New job applications\n• New messages\n• Project updates\n• Contract changes\n• Profile views\n• System announcements\n\n⚙️ **Settings:**\n• Go to /account-settings\n• Toggle email notifications on/off\n• In-app notifications always shown\n\n💡 Tip: Keep email notifications ON so you never miss an opportunity!",
          skills: "**Skills on HustleX:**\n\n🎯 **Available Categories (200+):**\n• Web Development (React, Node.js, PHP, Laravel...)\n• Mobile Apps (React Native, Flutter, Swift...)\n• UI/UX Design (Figma, Adobe XD...)\n• Graphic Design (Photoshop, Illustrator...)\n• Writing & Translation\n• Data Entry & Admin\n• Digital Marketing\n• Video & Animation\n• AI & Machine Learning\n• ...and many more!\n\n✅ **Verification:**\n• Take skills tests to earn badges\n• Badges appear on your profile\n• Verified freelancers get more jobs!\n\n💡 Add ALL relevant skills to your profile at /profile-setup",
          howItWorks: "**How HustleX Works (4 Steps):**\n\n1️⃣ **Create Account**\n   Sign up free as Client or Freelancer at /signup\n\n2️⃣ **Post or Find Jobs**\n   Clients post projects, freelancers browse & apply\n\n3️⃣ **Connect & Collaborate**\n   Communicate via messaging, video calls, share files\n\n4️⃣ **Deliver & Review**\n   Complete the work, leave ratings & reviews\n\n🔗 Learn more: /HowItWorks",
          categories: "**Job Categories on HustleX:**\n\n💻 **Technology:** Web Dev, Mobile Apps, AI/ML, Data Science, DevOps\n🎨 **Design:** UI/UX, Graphic Design, Logo, Branding, 3D\n📝 **Writing:** Content, Copywriting, Translation, Technical Writing\n📊 **Business:** Marketing, SEO, Social Media, Analytics\n🎬 **Media:** Video Editing, Animation, Photography, Voice-over\n📱 **Mobile:** iOS, Android, Cross-platform\n🏗️ **Other:** Data Entry, Virtual Assistant, Customer Support\n\n🔍 Browse all categories: /job-listings",
          security: "**Security on HustleX:**\n\n🔒 **How we protect you:**\n• **Email verification** — prevents fake accounts\n• **Skills badges** — verified freelancers are trusted\n• **Reviews system** — transparent feedback\n• **Dispute resolution** — fair conflict handling\n• **HTTPS encryption** — all data encrypted\n• **Rate limiting** — protection against spam\n\n🛡️ Your data is safe on HustleX!",
          companyProfile: "**Company Profiles:**\n\n🏢 Create your business profile at /company-profile\n• Add company name, logo, description\n• List your industry and size\n• Post jobs under your brand\n• Build trust with freelancers\n\n💡 A professional company profile attracts top talent!",
          telegram: "**HustleX on Telegram:**\n\n📱 **Channel:** @HustleXeth\n• Latest job postings\n• Platform news & updates\n• Freelancing tips\n• Community discussions\n\n💬 Follow us for real-time updates and opportunities!",
          mobile: "**Mobile Access:**\n\n📱 HustleX works on all devices!\n• Fully responsive web design\n• Works on phones, tablets, and desktops\n• Same features on all screen sizes\n• Dark mode available\n\n🔗 Just visit hustleX.com on your mobile browser!",
          escrow: "**Payment Security on HustleX:**\n\n💳 **How payments work:**\nPayments are processed directly between client and freelancer using supported methods (Telebirr, CBE Birr, Bank Transfer).\n\n🛡️ **Protection:**\n• Dispute resolution available for both parties\n• All communication stays on the platform\n• Contact support for any payment concerns",
          deleteAccount: "**Account Management:**\n\n⚙️ Go to /account-settings for:\n• Update profile info\n• Change password\n• Manage notifications\n• Privacy settings\n\n❓ To delete your account, contact support:\n📧 hustleXet@gmail.com\n📱 Telegram: @HustleXeth\n\n💡 Note: Active contracts must be completed before account deletion.",
          changeRole: "**Switching Roles:**\n\n👤 Each account is either a Client OR a Freelancer.\n\n🔄 **To change your role:**\n• Contact support at hustleXet@gmail.com\n• Or create a new account with the desired role\n\n💡 Tip: Choose carefully during signup! Clients hire, Freelancers work.",
          api: "**HustleX API:**\n\n🔧 **API Access** (Premium plan only):\n• RESTful API endpoints\n• Job posting & management\n• Freelancer search\n• Application tracking\n\n📖 API documentation: /api\n\n💎 Upgrade to Premium (9,999 ETB/mo) for API access!",
          aboutUs: "**About HustleX:**\n\n🇪🇹 Made with ❤️ in Ethiopia\n\nHustleX is Ethiopia's premier freelance marketplace connecting talented freelancers with businesses worldwide. Our mission is to empower Ethiopian talent and create economic opportunities through technology.\n\n🌐 Website: hustleX.com\n📧 Email: hustleXet@gmail.com\n📱 Telegram: @HustleXeth\n\n🔗 Learn more: /about-us",
          helpCenter: "**HustleX Help Center:**\n\n❓ Need help? Visit /help-center for:\n• Step-by-step guides\n• Video tutorials\n• Troubleshooting tips\n• Best practices\n\n📖 Also check:\n• FAQ: /faq\n• How It Works: /HowItWorks\n• Contact: /contact-us\n\nWe're here to help you succeed! 💪",
          multipleProjects: "**Can I work on multiple projects at once?**\n\n✅ **Yes!** You can work on multiple projects simultaneously:\n\n• There's **no limit** on active projects\n• Manage all projects from your dashboard (/dashboard/freelancer)\n• Set your availability status to show when you're open\n• Use the calendar to track deadlines\n• Communicate with multiple clients efficiently via messaging\n\n⚠️ **Important tip:** Make sure you can deliver quality work on time for ALL projects. Overcommitting can hurt your reputation and ratings!\n\n💡 **Best practices:**\n• Be realistic about your capacity\n• Communicate timelines clearly\n• Prioritize deadlines\n• Don't accept more than you can handle",
          getHired: "**How to increase your chances of getting hired:**\n\n1️⃣ **Complete your profile 100%** — all sections filled\n2️⃣ **Professional photo** — clear, well-lit headshot\n3️⃣ **Compelling bio** — highlight achievements with numbers\n4️⃣ **Showcase best work** in your portfolio\n5️⃣ **Get verified badges** — take skills tests\n6️⃣ **Collect positive reviews** from completed projects\n7️⃣ **Respond quickly** to messages (within 24 hours)\n8️⃣ **Tailored proposals** — write personalized ones for each job\n9️⃣ **Keep availability updated**\n🔟 **Specialize** in specific skills rather than being a generalist\n\n🚀 Active freelancers with complete profiles get **3x more** job invitations!",
          notSatisfied: "**What if I'm not satisfied with the work?**\n\nWe have a dispute resolution process:\n\n1️⃣ **Communicate first** — talk to the freelancer to resolve issues\n2️⃣ **Request revisions** if the work doesn't meet requirements\n3️⃣ **Open a dispute** if unresolved — go to the contract page\n4️⃣ **Our team reviews** your case within 48 hours\n5️⃣ **Fair mediation** — we find a solution based on evidence\n\n💡 **Tips:**\n• For projects, request changes BEFORE approving\n• Always review work carefully before approving payments\n• Keep all communication on the platform\n• Document issues with screenshots\n\n📧 Contact support: hustleXet@gmail.com",
          paymentSecurity: "**Is my payment information secure?**\n\n✅ **Yes, absolutely!** We use industry-standard security:\n\n🔒 **Security measures:**\n• All payment data encrypted using SSL/TLS\n• PCI DSS compliance\n• Payment info never stored on our servers\n• Trusted payment processors\n• Two-factor authentication available\n• Regular security audits\n\n💳 **Supported methods:**\n• Telebirr (Ethiopian mobile money)\n• CBE Birr (Commercial Bank of Ethiopia)\n• Bank Transfer\n\n🛡️ **Protection:**\n• Dispute resolution available\n• Contact support for any concerns\n\nYour financial information is protected with **bank-level security**! 🔐",
          findRightFreelancer: "**How to find the right freelancer:**\n\n1️⃣ **Post a detailed job** with clear requirements\n2️⃣ **Browse profiles** and portfolios\n3️⃣ **Review ratings** and completed projects\n4️⃣ **Use filters** — skills, experience, rate, location\n5️⃣ **Send messages** to ask questions\n6️⃣ **Compare proposals** from candidates\n7️⃣ **Check availability** and response time\n8️⃣ **Hire the best match**\n\n💡 **Pro tips:**\n• Look for verified skills badges\n• Check portfolio samples for quality\n• Read reviews from previous clients\n• Message before hiring to discuss details\n\n🔗 Browse freelancers or post a job at /post-job",
          stats: "**HustleX by the Numbers:**\n\n👥 **10,000+** Elite Freelancers\n🏢 **5,000+** Happy Clients\n✅ **20 Million+** Successful Projects\n📈 **98%** Success Rate\n\nHustleX is Ethiopia's LARGEST freelance community! 🇪🇹\n\nJoin thousands of successful freelancers and businesses. Start at /signup!",
          categoriesList: "**Popular Freelance Categories on HustleX:**\n\n💻 **Development** — 1,200+ Freelancers\n🎨 **Design** — 800+ Freelancers\n📊 **Marketing** — 650+ Freelancers\n📱 **Mobile** — 450+ Freelancers\n📝 **Writing** — 1,000+ Freelancers\n🌐 **Translation** — 300+ Freelancers\n💼 **Business** — 900+ Freelancers\n🧠 **Consulting** — 700+ Freelancers\n🗣️ **Localization** — 250+ Freelancers\n📋 **Admin Support** — 500+ Freelancers\n🤖 **AI & Data Science** — 400+ Freelancers\n🎬 **Video & Audio** — 350+ Freelancers\n🛒 **E-commerce** — 900+ Freelancers\n📞 **Customer Support** — 600+ Freelancers\n🧘 **Lifestyle & Health** — 200+ Freelancers\n💰 **Finance & Legal** — 400+ Freelancers\n🏗️ **Engineering & Architecture** — 300+ Freelancers\n\n🔍 Browse all: /job-listings",
          testimonials: "**What Our Users Say:**\n\n💬 *\"HustleX transformed our hiring process. We found the perfect developer in just 3 days!\"*\n— **Messay A.**, CEO at Tonetor\n\n💬 *\"As a freelancer, I've been able to triple my income while working on projects I'm passionate about.\"*\n— **Messie A.**, Web Developer\n\n💬 *\"HustleX connects me with exceptional talent that delivers outstanding results every time.\"*\n— **Sara M.**, Project Manager\n\n⭐ Join 10,000+ happy users today at /signup!",
          howItWorksHome: "**How HustleX Works (4 Steps):**\n\n🔍 **Step 1: Browse Jobs**\nExplore a wide variety of freelance jobs posted by employers. Use filters to find exactly what matches your skills.\n\n📝 **Step 2: Apply or Post**\nFreelancers can apply to jobs that fit their expertise. Clients can post new jobs with all details.\n\n💬 **Step 3: Connect & Work**\nCommunicate securely through our platform, complete the tasks, and deliver quality work.\n\n💰 **Step 4: Get Paid**\nOnce work is completed and approved, payments are processed directly with your client.\n\n🚀 *\"Work smarter. Hustle faster.\"*\n\n🔗 Learn more: /HowItWorks | Get started: /signup",
          eliteFreelancers: "**Elite Freelancers on HustleX:**\n\n🌟 **Yohannes F.** — Developer\n   Skills: React, TypeScript, Tailwind CSS\n\n🌟 **Samuel T.** — Software Engineer\n   Skills: React, Laravel, CSS\n\n🌟 **Messie A.** — Developer\n   Skills: React, HTML, CSS, JS\n\n🌟 **Dagim D.** — Developer\n   Skills: React, JS, Tailwind CSS\n\n💡 These are just a few of our 10,000+ verified freelancers!\n\n🔍 Find your perfect match: /job-listings",
          ourStory: "**The HustleX Story:**\n\n📅 **Founded in 2023**, HustleX was born from a simple idea: *Ethiopia's talented professionals deserve better access to global opportunities.*\n\nOur founder, **Yohannes Fikre**, experienced the challenges of the traditional job market firsthand and set out to create a platform that would make freelance work **accessible, fair, and rewarding.**\n\n🇪🇹 Made with ❤️ in Ethiopia, connecting Ethiopian talent with the world.\n\n📈 **Where we are today:**\n• 10,000+ Active Freelancers\n• 5,000+ Happy Clients\n• 20M+ Successful Projects\n• 98% Success Rate\n\n🔗 Learn more: /about-us",
          founder: "**Meet Our Founder:**\n\n👨‍💼 **Yohannes Fikre** — Founder & CEO\n\n*\"Driven by a passion for connecting talent with opportunity, I created HustleX to empower freelancers and clients across Ethiopia and beyond. My goal is simple: make finding work and discovering talent seamless, fair, and inspiring. At HustleX, every connection is a step toward growth, creativity, and success.\"*\n\n💡 Visionary leader with **5+ years** in tech entrepreneurship\n🎯 Passionate about empowering Ethiopian talent\n🇪🇹 Based in Ethiopia\n\n🔗 Learn more: /about-us",
          team: "**The HustleX Team:**\n\n👨‍💼 **Yohannes Fikre** — Founder & CEO\n   Visionary leader with 5+ years in tech entrepreneurship, passionate about empowering Ethiopian talent.\n\n👩‍💻 **Messeret Ayalew** — Front-end Developer\n   Skilled in React, JavaScript, HTML, and CSS, creating clean, responsive, and user-friendly web applications.\n\n👨‍💻 **Dagim Debebe** — Full-stack Developer\n   Building robust, scalable solutions for our growing community.\n\n💪 A small but mighty team building Ethiopia's largest freelance platform!\n\n🔗 Join us: /signup",
          mission: "**Our Mission:**\n\n🌍 HustleX is building a community that connects skilled professionals with clients **worldwide.**\n\nOur mission goes beyond a marketplace — we're creating a **movement** that empowers Ethiopia's digital workforce to thrive in the global economy.\n\nThough we are just getting started, HustleX is already making a real impact.\n\n💎 **Our Values:**\n\n💡 **Innovation** — Continuously innovating with cutting-edge solutions\n🤝 **Community** — Building a supportive community where talent meets opportunity\n⭐ **Excellence** — Delivering exceptional quality and fostering professional growth\n🌐 **Global Reach** — Connecting Ethiopian talent with opportunities worldwide\n\n🔗 Learn more: /about-us",
          careers: "**Careers at HustleX:**\n\n🚀 We're always looking for talented people to join our growing team!\n\nCurrently our team includes:\n• Founder & CEO\n• Front-end Developer\n• Full-stack Developer\n\nWe're building Ethiopia's largest freelance community and need passionate people to help us grow.\n\n📧 Interested? Email us: hustleXet@gmail.com\n📱 Or reach out on Telegram: @HustleXeth\n\n🔗 Visit: /about-us | /contact-us",
          changePlan: "**Can I change plans later?**\n\n✅ **Yes!** You can upgrade or downgrade your plan at any time.\n\n📋 **How it works:**\n• Go to /pricing and select a new plan\n• Changes are reflected in your next billing cycle\n• No penalties for downgrading\n• Upgrade takes effect immediately\n\n💡 **Plans available:**\n• Free (0 ETB) — 3 jobs lifetime\n• Basic (999 ETB/mo) — 10 jobs/month\n• Premium (9,999 ETB/mo) — Unlimited jobs\n\n🔗 Upgrade now: /pricing",
          paymentMethods: "**Payment Methods Accepted:**\n\n💳 We currently support:\n\n📱 **Telebirr** — Ethiopian mobile money\n🏦 **CBE Birr** — Commercial Bank of Ethiopia\n🏦 **Awash Bank** — Mobile banking\n\n🚧 **Coming soon:**\n• More local payment methods\n• International payment methods\n\n💡 **How to pay:**\n1. Go to /pricing and choose a plan\n2. Select your payment method\n3. Complete the payment\n4. Plan activated instantly!\n\n📧 Questions? Email hustleXet@gmail.com",
          noContract: "**Is there a contract?**\n\n✅ **No contracts!**\n\n• Cancel your subscription at any time\n• **No penalties** for cancelling\n• No hidden fees\n• You keep access until end of billing period\n\n💡 **Money-back guarantee:**\n• 30-day money-back guarantee on all paid plans\n• Not satisfied? Get a full refund within 30 days!\n\n🔗 Try risk-free: /pricing",
          refund: "**Refund Policy:**\n\n✅ **Yes, we offer refunds!**\n\n🛡️ **30-Day Money-Back Guarantee** on all paid plans:\n\n• Not satisfied with your plan?\n• Request a refund within 30 days of purchase\n• Full refund — no questions asked\n\n📋 **How to request a refund:**\n1. Email: hustleXet@gmail.com\n2. Or contact us on Telegram: @HustleXeth\n3. Include your account email and reason\n4. Refund processed within 5-7 business days\n\n🔗 Try risk-free: /pricing",
          international: "**International Work on HustleX:**\n\n🌍 **Absolutely!** HustleX connects Ethiopian talent with clients worldwide.\n\n✅ **What this means:**\n• Freelancers can work with clients from any country\n• Clients can hire Ethiopian freelancers from anywhere\n• Cross-border collaboration is fully supported\n• Multi-language support (English, Amharic, Oromo, Tigrinya)\n• Multiple payment methods available\n\n🌐 Bridge the gap between Ethiopian talent and global opportunities!\n\n🔗 Get started: /signup",
          customerSupport: "**Customer Support on HustleX:**\n\n✅ **Yes! We provide 24/7 customer support!**\n\n📞 **Support channels:**\n• **Phone:** +251 942927999 (Mon-Fri 9AM-6PM EAT)\n• **Email:** hustleXet@gmail.com (response within 24 hours)\n• **Telegram:** @HustleXeth\n• **Help Center** — /help-center (guides, tutorials, FAQs)\n• **Live Chat** — Built-in chatbot (that's me! 🤖)\n• **Contact Form** — /contact-us\n\n🏢 **Office:** HustleX HQ, Addis Ababa, Ethiopia\n🕐 **Business Hours:** Mon-Fri 9AM-6PM EAT, weekend support available\n\n💡 Our support team is knowledgeable about both freelancer and client needs and can help resolve any issues quickly.",
          ratePlatform: "**How would we rate our platform?**\n\n⭐ Our platform is **user-friendly and easy to navigate**. We are constantly updating and improving it to provide the best experience for our users.\n\nBut we leave it to our users to rate us! 😊\n\n📊 What our users say:\n• *\"Found the perfect developer in just 3 days!\"* — Messay A., CEO\n• *\"Tripled my income as a freelancer\"* — Messie A., Developer\n• *\"Exceptional talent, outstanding results\"* — Sara M., PM\n\n🔗 Try it yourself: /signup",
        },
        patterns: [
          { keywords: ["hustlex", "platform", "website", "what is hustlex", "about hustlex"], topic: "platform" },
          { keywords: ["find job", "find work", "get job", "looking for job", "job listing", "browse job", "search job", "available job", "open position", "work opportunity", "find jobs", "finding jobs", "job openings"], topic: "findJobs" },
          { keywords: ["freelance", "start freelance", "become freelancer", "work as freelancer", "how to freelance", "freelancing", "freelancer guide", "start freelancing", "how do i freelance"], topic: "freelance" },
          { keywords: ["post job", "create job", "add job", "list job", "publish job", "need freelancer", "looking for freelancer", "post a job", "hire someone", "need developer", "need designer"], topic: "postJob" },
          { keywords: ["find freelancer", "search freelancer", "browse freelancer", "talent", "hire freelancer"], topic: "freelancer" },
          { keywords: ["sign up", "register", "join", "create account", "get started", "start using", "new account", "create an account"], topic: "signup" },
          { keywords: ["apply", "bid", "proposal", "submit proposal", "send proposal", "how to apply"], topic: "apply" },
          { keywords: ["feature", "video call", "file sharing", "what can hustlex do"], topic: "feature" },
          { keywords: ["price", "cost", "fee", "plan", "subscription", "pricing", "how much", "premium", "basic plan"], topic: "price" },
          { keywords: ["contact", "support", "email", "phone", "reach", "get in touch", "phone number", "call", "office", "location", "address", "business hours", "where are you", "addis ababa"], topic: "contact" },
          { keywords: ["contract", "agreement", "hire", "hiring"], topic: "contract" },
          { keywords: ["milestone", "phase", "deliverable"], topic: "milestone" },
          { keywords: ["pay", "payment", "transaction", "withdraw", "telebirr", "cbe birr", "get paid"], topic: "payment" },
          { keywords: ["profile", "bio", "photo", "portfolio", "profile setup", "complete profile"], topic: "profile" },
          { keywords: ["rating", "review", "stars", "feedback"], topic: "rating" },
          { keywords: ["password", "forgot", "reset", "can't sign in", "locked out", "login issue", "can't log in", "sign in problem"], topic: "troubleshoot" },
          { keywords: ["work", "how to work", "how can i work", "get work", "start working", "earn money", "make money", "how can i freelance"], topic: "freelance" },
          { keywords: ["login", "sign in", "account"], topic: "signup" },
          { keywords: ["help", "help center", "guide", "help me"], topic: "helpCenter" },
          { keywords: ["dark mode", "dark theme", "light mode", "theme", "night mode"], topic: "darkMode" },
          { keywords: ["blog", "article", "read", "write article", "blog post"], topic: "blog" },
          { keywords: ["dashboard", "my dashboard", "earnings", "overview", "analytics"], topic: "dashboard" },
          { keywords: ["message", "chat", "messaging", "talk to", "communicate", "video call"], topic: "messaging" },
          { keywords: ["dispute", "complaint", "problem with", "not satisfied", "raise dispute", "refund"], topic: "dispute" },
          { keywords: ["search", "filter", "sort", "browse"], topic: "search" },
          { keywords: ["edit job", "update job", "change job", "modify job"], topic: "editJob" },
          { keywords: ["notification", "alert", "email notification", "notify"], topic: "notifications" },
          { keywords: ["skill", "skills", "category", "categories", "badge", "verification", "verified"], topic: "skills" },
          { keywords: ["how it works", "how does it work", "steps", "process", "walkthrough"], topic: "howItWorks" },
          { keywords: ["security", "safe", "secure", "protect", "data protection", "encryption"], topic: "security" },
          { keywords: ["company", "business", "company profile", "organization"], topic: "companyProfile" },
          { keywords: ["telegram", "channel", "@hustlexeth"], topic: "telegram" },
          { keywords: ["mobile", "app", "phone", "responsive", "tablet"], topic: "mobile" },
          { keywords: ["hold money", "secure payment", "money safe"], topic: "escrow" },
          { keywords: ["delete", "delete account", "close account", "remove account"], topic: "deleteAccount" },
          { keywords: ["change role", "switch role", "become client", "become freelancer", "switch to"], topic: "changeRole" },
          { keywords: ["api", "developer", "integration", "webhook", "rest api"], topic: "api" },
          { keywords: ["about us", "who are you", "about hustleX", "mission", "vision"], topic: "aboutUs" },
          { keywords: ["faq", "frequently asked", "common question", "quick answer"], topic: "helpCenter" },
          { keywords: ["multiple project", "several project", "more than one project", "many project", "simultaneously", "at the same time", "at once"], topic: "multipleProjects" },
          { keywords: ["get hired", "chances of getting hired", "increase chances", "stand out", "more visible", "get more job", "attract client", "win work"], topic: "getHired" },
          { keywords: ["not satisfied", "bad work", "poor quality", "unhappy with", "not happy", "disappointed", "worst experience", "terrible work"], topic: "notSatisfied" },
          { keywords: ["payment secure", "payment safe", "payment information", "is my payment", "money safe", "financial information", "pci", "encrypted"], topic: "paymentSecurity" },
          { keywords: ["find right freelancer", "right freelancer", "best freelancer", "good freelancer", "choose freelancer", "select freelancer"], topic: "findRightFreelancer" },
          { keywords: ["stats", "statistics", "how many freelancer", "how many client", "success rate", "how big", "numbers", "users", "community"], topic: "stats" },
          { keywords: ["category", "categories", "what categories", "available categories", "job categories", "types of work", "fields", "industries"], topic: "categoriesList" },
          { keywords: ["testimonial", "review", "what users say", "user experience", "success story", "triple income", "tonetor"], topic: "testimonials" },
          { keywords: ["browse job", "apply or post", "connect and work", "get paid", "how hustlex works", "steps", "4 steps", "work smarter"], topic: "howItWorksHome" },
          { keywords: ["elite freelancer", "top freelancer", "featured freelancer", "yohannes", "samuel", "dagim", "messie"], topic: "eliteFreelancers" },
          { keywords: ["our story", "history", "founded", "when was hustlex", "how did hustlex start", "origin story", "background"], topic: "ourStory" },
          { keywords: ["founder", "ceo", "who created", "who founded", "yohannes fikre", "creator"], topic: "founder" },
          { keywords: ["team", "our team", "who works", "employees", "developers", "messeret", "dagim debebe"], topic: "team" },
          { keywords: ["mission", "vision", "values", "what do you believe", "goals", "purpose"], topic: "mission" },
          { keywords: ["careers", "jobs at hustlex", "hiring", "work at hustlex", "join the team", "open positions"], topic: "careers" },
          { keywords: ["change plan", "upgrade plan", "downgrade", "switch plan", "change subscription", "upgrade subscription"], topic: "changePlan" },
          { keywords: ["payment method", "how to pay", "accept payment", "telebirr", "cbe birr", "awash bank", "ways to pay", "pay with"], topic: "paymentMethods" },
          { keywords: ["contract", "cancel", "cancellation", "is there a contract", "cancel subscription", "no contract", "penalty"], topic: "noContract" },
          { keywords: ["refund", "money back", "money-back", "get my money back", "return money", "not satisfied refund"], topic: "refund" },
          { keywords: ["international", "global", "worldwide", "other countries", "cross-border", "overseas", "abroad"], topic: "international" },
          { keywords: ["customer support", "support available", "help available", "live support", "24/7", "customer service", "live chat"], topic: "customerSupport" },
          { keywords: ["rate platform", "how good", "platform rating", "rate your", "review platform", "user friendly"], topic: "ratePlatform" },
        ],
        defaultGreeting: "Hello! 👋 Welcome to HustleX! I'm HustleX AI, your intelligent assistant. I can help you with posting jobs, finding freelancers, contracts, payments, profiles, and much more. What would you like to know?",
        thankYou: "You're welcome! 😊 Feel free to ask if you need any more help with HustleX!",
        howAreYou: "I'm doing great, thank you for asking! 😊 I'm HustleX AI, ready to help you with our freelancing platform. How can I assist you today?",
        unrelated: [
          "Great question! 😊 While I'm the HustleX assistant, I can help you with freelancing topics too! Here's what I can help with:\n\n• **Finding jobs** — ask 'how to find jobs'\n• **Starting freelancing** — ask 'how to freelance'\n• **Posting jobs** — ask 'how to post a job'\n• **Pricing & plans** — ask about plans\n• **Profile setup** — ask about profiles\n\nWhat would you like to know?",
          "I'm HustleX AI! 🤖 I can help you with:\n\n• Finding freelance work on HustleX\n• Posting jobs as a client\n• Setting up your profile\n• Payments and contracts\n• Pricing plans\n\nTry asking something specific like 'how can I find jobs' or 'how do I start freelancing'!",
          "Thanks for your question! 😊 I'm best at helping with HustleX and freelancing. Try asking:\n\n• 'How to find jobs on HustleX'\n• 'How to start freelancing'\n• 'What are the pricing plans?'\n• 'How to post a job'\n\nI'm here to help you succeed! 🚀"
        ]
      },
      am: {
        answers: {
          platform: "HustleX የኢትዮጵያ ዋና የነጻ ስራ መድረክ ነው። 🇪🇹\n\n• ስራ መለጠፍ እና ፕሮጀክት ማስተዳደር\n• ነጻ ሰራተኞችን መፈለግ\n• የቀጥታ መልእክት እና የቪዲዮ ጥሪ\n• ደህንነቱ የተጠበቀ ክፍያ (Telebirr, CBE Birr)\n• ኮንትራቶች እና ደረጃዎች\n• የስራ ናሙና ማስተዳደር\n• ክህሎት ማረጋገጫ\n• ደረጃ እና ግምገማ\n\n📧 hustleXet@gmail.com | 📱 Telegram: @HustleXeth",
          findJobs: "ስራ ለማግኘት:\n\n1. እንደ ነጻ ሰራተኛ ይመዝገቡ (/signup)\n2. መገለጫዎን ይሙሉ - ፎቶ፣ ስራ ናሙና፣ ክህሎቶች\n3. ወደ ስራ ዝርዝር ይሂዱ (/job-listings)\n4. በክፍል፣ በጀት፣ ክህሎት ያጣሩ\n5. ስራውን ይጫኑ እና ለማመልከት ፕሮፖዛል ይላኩ\n6. ተቀባይነት ያግኙ እና ስራ ይጀምሩ!\n\n💡 ምክር: መገለጫዎን 100% ይሙሉ!",
          freelance: "ነጻ ሰራተኛ ለመሆን:\n\n1. ነጻ መለያ ይፍጠሩ (/signup)\n2. መገለጫ ይሙሉ - ፎቶ፣ ባዮ፣ ክህሎቶች\n3. የስራ ናሙና ይጨምሩ\n4. ክህሎቶችን ያረጋግጡ\n5. ስራ ይፈልጉ እና ያመልክቱ\n6. ጥራት ያለው ስራ ያቅርቡ፣ ደረጃ ያግኙ!\n\n🚀 ሙሉ መገለጫ = ብዙ ደንበኞች!",
          postJob: "ስራ ለመለጠፍ፡\n\n1. እንደ ደንበኛ ይመዝገቡ\n2. 'ስራ ለጥፍ' ይጫኑ (/post-job)\n3. ርዕስ፣ መግለጫ፣ ክህሎቶች፣ በጀት ያስገቡ\n4. ያስገቡ - ስራው ለሁሉም ይታያል\n5. ፕሮፖዛሎችን ይገምግሙ\n6. ተስማሚውን ይቅጠሩ!\n\n💡 ነጻ: 3 ስራዎች | መሰረታዊ (999 ብር/ወር): 10 ስራዎች",
          job: "ስራ ለመለጠፍ፡ 'ስራ ለጥፍ' የሚለውን ይጫኑ፣ የስራውን ርዕስ፣ መግለጫ፣ በጀት እና የሚያስፈልጉ ክህሎቶችን ያስገቡ።",
          freelancer: "ነጻ ሰራተኞችን ለማግኘት፡ ዝርዝሩን ያስሱ፣ ማጣሪያዎችን (ክህሎት፣ ልምድ፣ ቦታ) ይጠቀሙ ወይም ስራ ይለጥፉ።",
          signup: "ለመመዝገብ፡ /signup ይሂዱ፣ ሚናዎን ይምረጡ (ነጻ ሰራተኛ/ደንበኛ)፣ ኢሜይል እና ዝርዝር ያስገቡ። ነጻ ነው!",
          apply: "ለስራ ለማመልከት፡ /job-listings ይሂዱ፣ ስራ ይፈልጉ፣ ይጫኑ፣ ፕሮፖዛል ይላኩ። ግል ፕሮፖዛል ይጻፉ!",
          feature: "HustleX ምን ያቀርባል:\n• ስራ መለጠፍ እና ማስተዳደር\n• ሰራተኛ መፈለግ\n• የቀጥታ መልእክት እና ቪዲዮ ጥሪ\n• ደህንነቱ የተጠበቀ ክፍያ\n• ፖርትፎሊዮ ማስተዳደር\n• ደረጃ እና ግምገማ\n• ጥቁር ሞድ\n• ብዙ ቋንቋዎች",
          price: "የHustleX ዋጋዎች:\n\n• ነጻ (0 ብር): 3 ስራዎች\n• መሰረታዊ (999 ብር/ወር): 10 ስራዎች + ቅድሚያ\n• ፕሪሚየም (9,999 ብር/ወር): ያልተገደበ + API\n\n/pricing ይጎብኙ!",
          contact: "ያግኙን:\n📧 hustleXet@gmail.com\n📱 Telegram: @HustleXeth\n📋 /contact-us\n❓ /help-center",
          contract: "ኮንትራቶች: ደንበኛ ሰራተኛን ሲቀጥር ይፈጠራሉ። ስራ፣ በጀት፣ ጊዜ እና ደረጃዎችን ይገልጻሉ።",
          milestone: "ደረጃዎች: ፕሮጀክትን ወደ ትንንሽ ክፍሎች ይከፍላሉ። እያንዳንዱ ውጤት እና ክፍያ አለው።",
          payment: "ክፍያ: Telebirr, CBE Birr, ባንክ። ደህንነቱ የተጠበቀ! ገንዘብ እስከ ማጽደቅ ድረስ ይያዛል።",
          profile: "መገለጫ: ፎቶ፣ ባዮ፣ ክህሎቶች፣ ሰዓታዊ ዋጋ፣ ፖርትፎሊዮ ይሙሉ። /profile-setup ይሂዱ!",
          rating: "ደረጃ: ፕሮጀክት ከተጠናቀቀ በኋላ ሁለቱም ወገኖች 5-ኮከብ ደረጃ ይሰጣሉ።",
          troubleshoot: "ችግር? /forgot-password ለይለፍ ቃል፣ /profile-setup ለመገለጫ፣ ካሽ ያጽዱ።",
          darkMode: "ጥቁር ሞድ: ከላይ ቀኝ ያለውን ጨረቃ/ፀሐይ አዶ ይጫኑ!",
          dashboard: "ዳሽቦርድ:\n• ደንበኛ: /dashboard/hiring\n• ሰራተኛ: /dashboard/freelancer\n• ማመልከቻዎች: /applications-management",
          messaging: "መልእክት: /chat ይሂዱ። ጽሁፍ፣ ፋይሎች፣ ቪዲዮ ጥሪ (ፕሪሚየም)!",
          skills: "ክህሎቶች (200+): Web Dev, Mobile, Design, Writing, Marketing... ክህሎትዎን ያረጋግጡ!",
          security: "ደህንነት: ደህንነቱ የተጠበቀ ክፍያ፣ ኢሜይል ማረጋገጫ፣ HTTPS ምስጠራ። ደህንነትዎ ተጠብቋል!",
          telegram: "Telegram: @HustleXeth ይከታተሉ! ስራዎች፣ ዜናዎች፣ ምክሮች።",
        },
        patterns: [
          { keywords: ["hustlex", "ፕላትፎርም", "መድረክ", "ምንድን", "ስለ", "ዌብሳይት"], topic: "platform" },
          { keywords: ["ስራ ፈልግ", "ስራ ማግኘት", "ስራ ፈልጌ", "የስራ ዝርዝር", "ስራ እፈልጋለሁ"], topic: "findJobs" },
          { keywords: ["ነጻ ሰራተኛ መሆን", "ፍሪላንስ", "እንዴት ሰራተኛ", "ስራ ለመስራት", "ነጻ ስራ"], topic: "freelance" },
          { keywords: ["ስራ ለጥፍ", "ስራ መለጠፍ", "መፍጠር", "ቀጣሪ", "ማሰራት", "ስራ ለጠፍ"], topic: "postJob" },
          { keywords: ["መፈለግ", "ሰራተኛ", "ፍሪላንሰር", "ባለሙያ", "ሰው ፈልግ"], topic: "freelancer" },
          { keywords: ["መመዝገብ", "መቀላቀል", "አካውንት", "ሎግኢን", "ሳይን", "ተመዝገብ"], topic: "signup" },
          { keywords: ["ማመልከት", "መወዳደር", "ፕሮፖዛል", "አመልክት"], topic: "apply" },
          { keywords: ["አገልግሎት", "ፊውቸር", "ቪዲዮ", "ቻት", "ባህሪ"], topic: "feature" },
          { keywords: ["ዋጋ", "ክፍያ", "ገንዘብ", "ኮሚሽን", "ምን ያህል", "ፕሪሚየም"], topic: "price" },
          { keywords: ["ማግኘት", "ድጋፍ", "እርዳታ", "ስልክ", "ኢሜይል", "Telegram"], topic: "contact" },
          { keywords: ["ኮንትራት", "ስምምነት", "ቅጥር", "ማስራት"], topic: "contract" },
          { keywords: ["ደረጃ", "ክፍል", "ምዕራፍ"], topic: "milestone" },
          { keywords: ["ገንዘብ", "ክፍያ", "Telebirr", "CBE", "ክፈል"], topic: "payment" },
          { keywords: ["መገለጫ", "ፎቶ", "ባዮ", "ፖርትፎሊዮ"], topic: "profile" },
          { keywords: ["ግምገማ", "ኮከብ", "ደረጃ ስጥ"], topic: "rating" },
          { keywords: ["ይለፍ ቃል", "ረሳሁ", "ቀይር", "ችግር"], topic: "troubleshoot" },
          { keywords: ["ጥቁር ሞድ", "ጨለማ", "ብርሃን"], topic: "darkMode" },
          { keywords: ["ዳሽቦርድ", "ገቢ", "ማመልከቻ"], topic: "dashboard" },
          { keywords: ["መልእክት", "ቻት", "ውይይት", "ቪዲዮ"], topic: "messaging" },
          { keywords: ["ክህሎት", "ምድብ", "ማረጋገጫ"], topic: "skills" },
          { keywords: ["ደህንነት", "ጥበቃ", "ምስጠራ"], topic: "security" },
          { keywords: ["ቴሌግራም", "ቻናል", "@HustleXeth"], topic: "telegram" },
        ],
        defaultGreeting: "ሰላም! 👋 ወደ HustleX እንኳን በደህና መጡ! እኔ HustleX AI ነኝ። ስራ ለማግኘት፣ ስራ ለመለጠፍ፣ ክፍያ፣ መገለጫ እና ሌሎችን ልረዳዎ እችላለሁ። ምን ማወቅ ይፈልጋሉ?",
        thankYou: "ምንም አይደል! 😊 ሌላ ጥያቄ ካለዎት ይጠይቁ።",
        unrelated: [
          "ጥያቄዎ ጥሩ ነው! 😊 እኔ የHustleX ረዳት ነኝ። ስለ ስራ ማግኘት፣ ስራ መለጠፍ፣ ዋጋ፣ ወይም መገለጫ ይጠይቁኝ!",
          "ይቅርታ፣ ስለ HustleX ብቻ ነው መረጃ የምሰጠው። 'ስራ እንዴት ላገኝ?' ወይም 'እንዴት ልመዝገብ?' ይሞክሩ! 🤖"
        ]
      },
      om: {
        answers: {
          platform: "HustleX plaatformii hojii bilisaa Itoophiyaa isa cimaadha! 🇪🇹\n\n• Hojii baasuu fi bulchuu\n• Hojjattoota bilisaa barbaaduu\n• Ergaa kallattii fi waamicha viidiyoo\n• Kaffaltii amansiisaa (Telebirr, CBE Birr)\n• Koontrat fi milestone\n• Portfolio bulchuu\n• Mirkaneessa ogummaa\n• Safartuu fi yaada\n\n📧 hustleXet@gmail.com | 📱 Telegram: @HustleXeth",
          findJobs: "Hojii argachuuf:\n\n1. Akka hojjataa bilisaa galmaa'i (/signup)\n2. Profilee kee guuti - suuraa, ogummaa, sa'aatii\n3. Gara /job-listings deemi\n4. Ramaddii, baajeta, ogummaan calali\n5. Hojii filadhu fi proposal ergi\n6. Filatamuu fi hojii jalqabi!\n\n💡 Gorsa: Profilee kee 100% guuti!",
          freelance: "Hojataa bilisaa ta'uuf:\n\n1. Akkaawuntii bilisaa uumi (/signup)\n2. Profilee guuti - suuraa, bio, ogummaa\n3. Hojii kee agarsiisi (portfolio)\n4. Ogummaa mirkaneessi\n5. Hojii barbaadi fi iyyadhu\n6. Hojii gaarii kenni, safartuu gaarii argadhu!\n\n🚀 Profilee guutuun = maamilaa baay'ee!",
          postJob: "Hojii baasuuf:\n\n1. Akka daldalaa galmaa'i\n2. 'Hojii Baasi' cuqaasi (/post-job)\n3. Mata-duree, ibsa, ogummaa, baajeta galchi\n4. Ergi - hojii kee hundaa ni mul'ata\n5. Proposal ilaalaa\n6. Isa gaarii filadhu!\n\n💡 Bilisaa: Hojii 3 | Bu'uuraa (999 ETB/ji'a): Hojii 10",
          job: "Hojii baasuuf: Gara /post-job deemaa, mata-duree, ibsa, baajeta fi ogummaa galchaa.",
          freelancer: "Hojjattoota bilisaa argachuuf: Tarreeffama ilaalaa, filannoo fayyadamaa ykn hojii baasaa.",
          signup: "Galmaa'uuf: /signup deemaa, gahee kee filadhu (hojjataa/daldalaa), email guutaa. Bilisaan!",
          apply: "Hojiif iyyachuuf: /job-listings deemaa, hojii filadhu, 'Apply' cuqaasi. Proposal dhuunfaa barreessi!",
          feature: "Amaloota HustleX:\n• Hojii baasuu fi bulchuu\n• Hojjataa barbaaduu\n• Ergaa kallattii fi viidiyoo\n• Kaffaltii amansiisaa\n• Portfolio bulchuu\n• Safartuu fi yaada\n• Dark mode\n• Afaan baay'ee",
          price: "Gatii HustleX:\n\n• Bilisaa (0 ETB): Hojii 3\n• Bu'uuraa (999 ETB/ji'a): Hojii 10 + calali\n• Premium (9,999 ETB/ji'a): Daangaa hin qabu + API\n\n/pricing ilaalaa!",
          contact: "Nu qunnamaa:\n📧 hustleXet@gmail.com\n📱 Telegram: @HustleXeth\n📋 /contact-us\n❓ /help-center",
          contract: "Koontrat: Daldalaan hojjataa yoo qacaree uumama. Hojii, baajeta, yeroo fi milestone ibsa.",
          milestone: "Milestone: Pirojeektii gara kutaa xiqqaatti qooddata. Hundaa bu'aa fi kaffaltii qaba.",
          payment: "Kaffaltii: Telebirr, CBE Birr, baankii. Amansiisaa! Maallaqni hanga ragga'utti qabama.",
          profile: "Profilee: Suuraa, bio, ogummaa, sa'aatii, portfolio guuti. /profile-setup deemaa!",
          rating: "Safartuu: Pirojeektii erga xumurame booda lamaan saffartuu urjii 5 kennu.",
          troubleshoot: "Rakkoo? /forgot-password jecha iccitii, /profile-setup profileef, cache qulqulleessi.",
          darkMode: "Dark mode: Mallattoo ji'a/aduu mirga gubbaa cuqaasi!",
          dashboard: "Dashboard:\n• Daldalaa: /dashboard/hiring\n• Hojjataa: /dashboard/freelancer\n• Iyyannoo: /applications-management",
          messaging: "Ergaa: /chat deemaa. Barreeffama, faayilii, viidiyoo (Premium)!",
          skills: "Ogummaa (200+): Web Dev, Mobile, Design, Barreessuu, Marketing... Ogummaa kee mirkaneessi!",
          security: "Nageenya: Kaffaltii amansiisaa, mirkaneessa email, HTTPS. Nageenyi kee eegame!",
          telegram: "Telegram: @HustleXeth hordofi! Hojiiwwan, oduu, gorsa.",
        },
        patterns: [
          { keywords: ["hustlex", "plaatformii", "waa'ee", "maali"], topic: "platform" },
          { keywords: ["hojii argachuu", "hojii barbaaduu", "hojii ilaaluu", "hojii argadhu"], topic: "findJobs" },
          { keywords: ["hojjataa bilisaa", "bilisummaa", "akka hojjataa", "hojii hojjachuu"], topic: "freelance" },
          { keywords: ["hojii baasuu", "hojii uumuu", "hojjachiisuu", "hojii maxxansuu"], topic: "postJob" },
          { keywords: ["barbaaduu", "hojjataa", "ogeessa", "nama", "nama barbaaduu"], topic: "freelancer" },
          { keywords: ["galmaa'uu", "banuu", "akkaawuntii", "seenuu", "galmaa'i"], topic: "signup" },
          { keywords: ["iyyachuu", "dorgomuu", "proposal", "iyyadhu"], topic: "apply" },
          { keywords: ["amala", "tajaajila", "viidiyoo", "haasaa", "maal danda'a"], topic: "feature" },
          { keywords: ["gatii", "kaffaltii", "maallaqa", "meeqa", "premium"], topic: "price" },
          { keywords: ["qunnamuu", "gargaarsa", "bilbila", "email", "Telegram"], topic: "contact" },
          { keywords: ["koontrat", "waliigaltee", "qacaruu"], topic: "contract" },
          { keywords: ["milestone", "kutaa", "bu'aa"], topic: "milestone" },
          { keywords: ["kaffaluu", "kaffaltii", "Telebirr", "CBE", "maallaqa"], topic: "payment" },
          { keywords: ["profilee", "suuraa", "bio", "portfolio"], topic: "profile" },
          { keywords: ["safartuu", "yaada", "urjii"], topic: "rating" },
          { keywords: ["jecha iccitii", "irraanfadhe", "rakkoo"], topic: "troubleshoot" },
          { keywords: ["dark mode", "dukkana", "iftaa"], topic: "darkMode" },
          { keywords: ["dashboard", "galii", "iyyannoo"], topic: "dashboard" },
          { keywords: ["ergaa", "haasaa", "chat", "viidiyoo"], topic: "messaging" },
          { keywords: ["ogummaa", "ramaddii", "mirkaneessa"], topic: "skills" },
          { keywords: ["nageenya", "eegumsa", "icciitii"], topic: "security" },
          { keywords: ["telegram", "chaanaalii", "@HustleXeth"], topic: "telegram" },
        ],
        defaultGreeting: "Akkam! 👋 Baga nagaan gara HustleX dhuftan! Ani HustleX AI, gargaaraa keessani. Hojii argachuu, hojii baasuu, kaffaltii, profilee fi kanneen biroo isin gargaara. Maal beekuu barbaaddu?",
        thankYou: "Galatoomaa! 😊 Gaaffii biraa yoo qabaattan na gaafadhaa.",
        unrelated: [
          "Gaaffii gaarii dha! 😊 Ani gargaaraa HustleX. Waa'ee hojii argachuu, hojii baasuu, gatii, ykn profilee na gaafadhaa!",
          "Dhiifama, ani waa'ee HustleX qofan beeka. 'Hojii akkamitti argadha?' ykn 'Akkamitti galmaa'a?' yaalaa! 🤖"
        ]
      },
      ti: {
        answers: {
          platform: "HustleX ናይ ኢትዮጵያ ዋና ነጻ ስራሕ መድረኽ እዩ! 🇪🇹\n\n• ስራሕ ምልጣፍን ምምሕዳርን\n• ነጻ ሰራሕተኛታት ምድላይ\n• ቀጥታ መልእኽትን ቪድዮ ጻውዒትን\n• ውሕስ ክፍሊት (Telebirr, CBE Birr)\n• ኮንትራትን ምዕራፋትን\n• ፖርትፎልዮ ምምሕዳር\n• ክእለት ምርግጋጽ\n• ደረጃን ግምገማን\n\n📧 hustleXet@gmail.com | 📱 Telegram: @HustleXeth",
          findJobs: "ስራሕ ንምርካብ:\n\n1. ከም ነጻ ሰራሕተኛ ተመዝገብ (/signup)\n2. መገለጺ ምላእ - ስእሊ፣ ክእለት፣ ሰዓት\n3. ናብ /job-listings ኪድ\n4. ብምድብ፣ ባጀት፣ ክእለት ምረጽ\n5. ስራሕ ምረጽ፣ proposal ስደድ\n6. ተቐባልነት ረኺብካ ስራሕ ጀምር!\n\n💡 ምኽሪ: መገለጺ 100% ምላእ!",
          freelance: "ነጻ ሰራሕተኛ ንምዃን:\n\n1. ነጻ ኣካውንት ፍጠር (/signup)\n2. መገለጺ ምላእ - ስእሊ፣ ባዮ፣ ክእለት\n3. ስራሕ ኣርእስቲ (portfolio) ወስኽ\n4. ክእለት ኣረጋግጽ\n5. ስራሕ ድለይ፣ ኣመልክት\n6. ጽቡቕ ስራሕ ስራሕ፣ ደረጃ ረኺብካ!\n\n🚀 ምሉእ መገለጺ = ብዙሕ ዓማዊል!",
          postJob: "ስራሕ ንምልጣፍ:\n\n1. ከም ዓሚል ተመዝገብ\n2. 'ስራሕ ለጥፍ' ጠውቕ (/post-job)\n3. ኣርእስቲ፣ መግለጺ፣ ክእለት፣ ባጀት ኣእቱ\n4. ኣእቱ - ንኹሉ ይርአ\n5. Proposal ገምግም\n6. ዝበለጸ ምረጽ!\n\n💡 ነጻ: 3 ስራሕ | መሰረታዊ (999 ETB/ወርሒ): 10 ስራሕ",
          job: "ስራሕ ንምልጣፍ: /post-job ኪድ፣ ኣርእስቲ፣ መግለጺ፣ ባጀት ኣእቱ።",
          freelancer: "ነጻ ሰራሕተኛታት ንምርካብ: ዝርዝር ድለይ፣ ማጣሪያ ተጠቐም ወይ ስራሕ ለጥፍ።",
          signup: "ንምምዝጋብ: /signup ኪድ፣ ተራ ምረጽ (ሰራሕተኛ/ዓሚል)፣ email ኣእቱ። ነጻ!",
          apply: "ንስራሕ ንምምልካት: /job-listings ኪድ፣ ስራሕ ምረጽ፣ 'Apply' ጠውቕ። ውልቃዊ proposal ጸሓፍ!",
          feature: "ናይ HustleX ኣገልግሎታት:\n• ስራሕ ምልጣፍን ምምሕዳርን\n• ሰራሕተኛ ምድላይ\n• ቀጥታ መልእኽትን ቪድዮን\n• ውሕስ ክፍሊት\n• ፖርትፎልዮ\n• ደረጃን ግምገማን\n• Dark mode\n• ብዙሕ ቋንቋ",
          price: "ናይ HustleX ዋጋ:\n\n• ነጻ (0 ETB): 3 ስራሕ\n• መሰረታዊ (999 ETB/ወርሒ): 10 ስራሕ\n• ፕሪሚየም (9,999 ETB/ወርሒ): ደረት ዘይብሉ + API\n\n/pricing ተወከስ!",
          contact: "ርኸቡና:\n📧 hustleXet@gmail.com\n📱 Telegram: @HustleXeth\n📋 /contact-us\n❓ /help-center",
          contract: "ኮንትራት: ዓሚል ንሰራሕተኛ ምስ ቀጸረ ይፈጥር። ስራሕ፣ ባጀት፣ ግዜ ይገልጽ።",
          milestone: "ምዕራፋት: ፕሮጀክት ናብ ንኣሽቱ ክፋል ይቕይር። ነፍሲ ወከፍ ውጽኢትን ክፍሊትን ኣለዎ።",
          payment: "ክፍሊት: Telebirr, CBE Birr, ባንክ። ውሕስ! ገንዘብ ክሳብ ምጽዳቕ ይተሓዝ።",
          profile: "መገለጺ: ስእሊ፣ ባዮ፣ ክእለት፣ ሰዓት፣ ፖርትፎልዮ ምላእ። /profile-setup ኪድ!",
          rating: "ደረጃ: ፕሮጀክት ምስ ተወድአ ክልቲኦም 5-ከዋኽብቲ ደረጃ ይህቡ።",
          troubleshoot: "ጸገም? /forgot-password ንፓስወርድ፣ /profile-setup ንመገለጺ፣ cache ኣጽሪ።",
          darkMode: "Dark mode: ኣብ ላዕሊ የማን ዘሎ ወርሒ/ጸሓይ ጠውቕ!",
          dashboard: "ዳሽቦርድ:\n• ዓሚል: /dashboard/hiring\n• ሰራሕተኛ: /dashboard/freelancer\n• ኣመልከትቲ: /applications-management",
          messaging: "መልእኽቲ: /chat ኪድ። ጽሑፍ፣ ፋይል፣ ቪድዮ (Premium)!",
          skills: "ክእለት (200+): Web Dev, Mobile, Design, ጽሑፍ, Marketing... ክእለትካ ኣረጋግጽ!",
          security: "ውሕስነት: ውሕስ ክፍሊት፣ email ምርግጋጽ፣ HTTPS። ውሕስነትካ ተሓልዩ!",
          telegram: "Telegram: @HustleXeth ተኸታተል! ስራሕ፣ ዜና፣ ምኽሪ።",
        },
        patterns: [
          { keywords: ["hustlex", "መድረኽ", "እንታይ", "ብዛዕባ"], topic: "platform" },
          { keywords: ["ስራሕ ርኸብ", "ስራሕ ድለይ", "ስራሕ ረኺበ", "ናይ ስራሕ ዝርዝር"], topic: "findJobs" },
          { keywords: ["ነጻ ሰራሕተኛ", "ፍሪላንስ", "ከመይ ሰራሕተኛ", "ስራሕ ንምስራሕ"], topic: "freelance" },
          { keywords: ["ስራሕ ምልጣፍ", "ስራሕ ለጥፍ", "ምፍጣር", "ዓሚል"], topic: "postJob" },
          { keywords: ["ምድላይ", "ሰራሕተኛ", "ፍሪላንሰር", "ክኢላ"], topic: "freelancer" },
          { keywords: ["ምምዝጋብ", "ምእታው", "ኣካውንት", "ተመዝገብ"], topic: "signup" },
          { keywords: ["ምምልካት", "ምወዳደር", "proposal", "ኣመልክት"], topic: "apply" },
          { keywords: ["ኣገልግሎት", "ቪዲዮ", "መልእኽቲ", "ባህሪ"], topic: "feature" },
          { keywords: ["ዋጋ", "ክፍሊት", "ገንዘብ", "ክንደይ", "ፕሪሚየም"], topic: "price" },
          { keywords: ["ምርካብ", "ሓገዝ", "ስልኪ", "email", "Telegram"], topic: "contact" },
          { keywords: ["ኮንትራት", "ስምምዕ", "ቅጽረት"], topic: "contract" },
          { keywords: ["ምዕራፍ", "ክፋል", "ውጽኢት"], topic: "milestone" },
          { keywords: ["ክፈል", "ክፍሊት", "Telebirr", "CBE", "ገንዘብ"], topic: "payment" },
          { keywords: ["መገለጺ", "ስእሊ", "ባዮ", "ፖርትፎልዮ"], topic: "profile" },
          { keywords: ["ግምገማ", "ከዋኽብቲ", "ደረጃ"], topic: "rating" },
          { keywords: ["ፓስወርድ", "ረሲዐ", "ቀይር", "ጸገም"], topic: "troubleshoot" },
          { keywords: ["dark mode", "ጸልማት", "ብርሃን"], topic: "darkMode" },
          { keywords: ["ዳሽቦርድ", "ኣታዊ", "ኣመልካቲ"], topic: "dashboard" },
          { keywords: ["መልእኽቲ", "ቻት", "ዝርርብ", "ቪድዮ"], topic: "messaging" },
          { keywords: ["ክእለት", "ምድብ", "ምርግጋጽ"], topic: "skills" },
          { keywords: ["ውሕስነት", "ሓለዋ", "ምስጢር"], topic: "security" },
          { keywords: ["ቴለግራም", "ቻነል", "@HustleXeth"], topic: "telegram" },
        ],
        defaultGreeting: "ሰላም! 👋 ናብ HustleX ብደሓን መጻእኩም! ኣነ HustleX AI እየ። ስራሕ ምርካብ፣ ስራሕ ምልጣፍ፣ ክፍሊት፣ መገለጺን ካልእን ክሕግዘኩም እኽእል። እንታይ ክትፈልጡ ትደልዩ?",
        thankYou: "ብምንም! 😊 ካልእ ሕቶ እንተለኩም ሕተቱ።",
        unrelated: [
          "ጽቡቕ ሕቶ! 😊 ኣነ ናይ HustleX ሓጋዚ እየ። ብዛዕባ ስራሕ ምርካብ፣ ስራሕ ምልጣፍ፣ ዋጋ፣ ወይ መገለጺ ሕተተኒ!",
          "ይቕሬታ፣ ብዛዕባ HustleX ጥራይ እየ ሓበሬታ ዝህብ። 'ስራሕ ከመይ ረኺበ?' ወይ 'ከመይ ተመዝገብ?' ፈትን! 🤖"
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

    // Check for "how are you" type questions
    const howAreYouKeywords = ["how are you", "how's it going", "how do you do", "what's up", "how are things",
      "እንዴት ነህ", "እንዴት ነሽ", "akkam jirta", "ከመይ ኣለኹም"];
    if (howAreYouKeywords.some(kw => normalized.includes(kw))) {
      return currentLangConfig.howAreYou || "I'm doing great, thank you for asking! 😊 I'm HustleX AI, ready to help you with our freelancing platform. How can I assist you today?";
    }

    // If no specific match, check if it looks like a greeting
    const greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon",
      "ሰላም", "እንደምን", "ታዲያስ", "akkam", "nagaan", "selam", "ከመይ", "እንቋዕ"];
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
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 
              ${isMinimized 
                ? "w-[calc(100vw-2rem)] sm:w-80 h-16" 
                : "w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[600px]"
              } 
              max-w-[400px] rounded-2xl shadow-2xl overflow-hidden ${darkMode
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
                    HustleX AI
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
