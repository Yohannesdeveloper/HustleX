import React, { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBookOpen,
  FaLifeRing,
  FaQuestionCircle,
  FaRocket,
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
  FaVideo,
  FaUser,
  FaBriefcase,
  FaCreditCard,
  FaShieldAlt,
  FaComments,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
  FaPlayCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { HelpCenterSEO } from "../components/SEO";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views?: number;
  helpful?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenter: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = [
    {
      id: "getting-started",
      icon: <FaUser />,
      title: t.helpCenter.gettingStarted,
      desc: t.helpCenter.gettingStartedDesc,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "using-hustlex",
      icon: <FaBriefcase />,
      title: t.helpCenter.usingHustleX,
      desc: t.helpCenter.usingHustleXDesc,
      color: "from-purple-500 to-pink-500",
    },

    {
      id: "security",
      icon: <FaShieldAlt />,
      title: t.helpCenter.securitySafety,
      desc: t.helpCenter.securitySafetyDesc,
      color: "from-red-500 to-orange-500",
    },
    {
      id: "freelancer",
      icon: <FaRocket />,
      title: t.helpCenter.freelancerSuccess,
      desc: t.helpCenter.freelancerSuccessDesc,
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "client",
      icon: <FaBriefcase />,
      title: t.helpCenter.forClients,
      desc: t.helpCenter.forClientsDesc,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const articles: Article[] = [
    {
      id: "1",
      title: "How to create a standout freelancer profile",
      category: "getting-started",
      content: `Creating an outstanding freelancer profile is crucial for attracting clients. Here's a comprehensive guide:

1. **Professional Photo**: Use a clear, professional headshot that represents you well.

2. **Compelling Title**: Your title should be specific and highlight your expertise. Instead of "Freelancer," use "Senior Web Developer Specializing in React & Node.js."

3. **Detailed Overview**: Write a compelling overview that:
   - Introduces yourself professionally
   - Highlights your key skills and experience
   - Mentions your unique value proposition
   - Includes relevant keywords clients might search for

4. **Skills Section**: List all relevant skills and ensure they match the skills clients are looking for. Be honest about your proficiency levels.

5. **Portfolio**: Add your best work samples. Include:
   - Project descriptions
   - Technologies used
   - Results achieved
   - Client testimonials if available

6. **Education & Certifications**: Add your educational background and any relevant certifications.

7. **Availability**: Keep your availability status updated so clients know when you're available.

8. **Pricing**: Set competitive rates based on your experience and market rates.

Remember: A complete, detailed profile increases your chances of being hired by 40%!`,
      tags: ["profile", "freelancer", "getting-started"],
      views: 1250,
      helpful: 89,
    },
    {
      id: "2",
      title: "Posting your first job the right way",
      category: "using-hustlex",
      content: `Posting a job that attracts quality freelancers requires careful planning. Follow these steps:

1. **Clear Job Title**: Be specific about what you need. "Need a logo designer" is vague. "Need a logo designer for tech startup - modern and minimalist style" is better.

2. **Detailed Description**: Include:
   - Project scope and objectives
   - Specific requirements
   - Deliverables expected
   - Timeline and deadlines
   - Budget range (if comfortable sharing)

3. **Required Skills**: List all necessary skills and tools. This helps freelancers self-assess if they're a good fit.

4. **Attachments**: Add any relevant files, examples, or reference materials.

5. **Budget**: Set a realistic budget. Too low may attract low-quality work; too high may waste resources.

6. **Timeline**: Be realistic about deadlines. Rushed projects often result in lower quality.

7. **Screening Questions**: Add 2-3 relevant questions to filter candidates:
   - "How many years of experience do you have with [specific skill]?"
   - "Can you provide examples of similar projects?"
   - "What's your availability for this project?"

8. **Review Before Posting**: Double-check for typos, clarity, and completeness.

A well-written job posting receives 3x more quality proposals!`,
      tags: ["job", "posting", "client"],
      views: 980,
      helpful: 67,
    },
    {
      id: "3",
      title: "Secure payments and milestones explained",
      category: "billing",
      content: `HustleX uses an escrow system to protect both clients and freelancers. Here's how it works:

**For Clients:**
1. **Fund Escrow**: When you hire a freelancer, you'll fund the project amount into escrow.
2. **Milestone Payments**: Break your project into milestones. Each milestone has a specific deliverable and payment amount.
3. **Release Payment**: Once a milestone is completed and you're satisfied, release the payment.
4. **Dispute Resolution**: If there's an issue, you can request changes or open a dispute. HustleX will mediate.

**For Freelancers:**
1. **Secure Payment**: Funds are held in escrow, so you're guaranteed payment for completed work.
2. **Milestone Approval**: Submit your work for each milestone. The client reviews and approves.
3. **Payment Release**: Once approved, payment is released to your account.
4. **Withdrawal**: You can withdraw funds to your bank account or payment method.

**Milestone Best Practices:**
- Break large projects into 3-5 milestones
- Set clear deliverables for each milestone
- Agree on review timeframes (typically 3-7 days)
- Communicate clearly about expectations

**Payment Methods:**
- Credit/Debit Cards
- Bank Transfer
- Mobile Money (where available)
- PayPal

All transactions are secure and encrypted.`,
      tags: ["payment", "milestone", "escrow", "billing"],
      views: 2100,
      helpful: 145,
    },
    {
      id: "4",
      title: "Messaging etiquette: best practices",
      category: "using-hustlex",
      content: `Effective communication is key to successful projects. Follow these guidelines:

**General Guidelines:**
1. **Be Professional**: Always maintain a professional tone, even in casual conversations.
2. **Be Clear**: State your needs, questions, or updates clearly and concisely.
3. **Respond Promptly**: Aim to respond within 24 hours during business days.
4. **Use Proper Grammar**: While perfection isn't required, clear communication is essential.

**For Clients:**
- Provide clear feedback on deliverables
- Be specific about what you like or want changed
- Set expectations about response times
- Use the project brief as a reference point

**For Freelancers:**
- Ask clarifying questions early
- Provide regular updates on progress
- Communicate any delays or issues immediately
- Share work-in-progress when appropriate

**Red Flags to Avoid:**
- Sharing personal contact information (use HustleX messaging)
- Requesting payment outside the platform
- Inappropriate language or behavior
- Ignoring messages for extended periods

**Tips:**
- Use video calls for complex discussions
- Document important decisions
- Keep all project communication on HustleX
- Be respectful of time zones

Good communication leads to better outcomes and higher ratings!`,
      tags: ["messaging", "communication", "etiquette"],
      views: 1560,
      helpful: 112,
    },
    {
      id: "5",
      title: "Protecting your account: security tips",
      category: "security",
      content: `Keep your HustleX account secure with these best practices:

**Password Security:**
1. Use a strong, unique password (at least 12 characters)
2. Include uppercase, lowercase, numbers, and symbols
3. Never share your password
4. Enable two-factor authentication (2FA)
5. Change your password regularly

**Account Settings:**
- Verify your email address
- Add a phone number for account recovery
- Review connected devices regularly
- Enable login notifications

**Payment Security:**
- Never share payment information via messages
- Use secure payment methods only
- Verify payment requests carefully
- Report suspicious activity immediately

**Phishing Protection:**
- Be wary of emails asking for login credentials
- Always check the sender's email address
- HustleX will never ask for your password via email
- When in doubt, contact support directly

**Profile Security:**
- Don't share personal contact information publicly
- Be cautious about sharing sensitive business information
- Review your profile visibility settings

**General Tips:**
- Log out from shared devices
- Keep your device software updated
- Use antivirus software
- Be cautious of suspicious links

**If You Suspect Compromise:**
1. Change your password immediately
2. Enable 2FA if not already enabled
3. Review recent account activity
4. Contact support immediately
5. Review and revoke access to suspicious apps

Your security is our priority!`,
      tags: ["security", "account", "protection"],
      views: 890,
      helpful: 78,
    },
    {
      id: "6",
      title: "How to write winning proposals",
      category: "freelancer",
      content: `A great proposal can make the difference between getting hired and being overlooked. Here's how to write winning proposals:

**1. Read the Job Posting Carefully:**
- Understand all requirements
- Note specific skills or experience needed
- Identify the client's pain points
- Check the budget and timeline

**2. Personalize Your Proposal:**
- Address the client by name
- Reference specific details from their job posting
- Show you've read and understood their needs
- Avoid generic, copy-paste proposals

**3. Structure Your Proposal:**
- **Opening**: Brief introduction and why you're interested
- **Understanding**: Show you understand their project
- **Solution**: Explain how you'll solve their problem
- **Experience**: Highlight relevant experience and skills
- **Timeline**: Provide a realistic timeline
- **Closing**: Call to action and next steps

**4. Highlight Relevant Work:**
- Include 2-3 most relevant portfolio pieces
- Explain how your past work relates to their project
- Share results and achievements

**5. Be Specific:**
- Instead of "I can do this," say "I'll use React and Node.js to build..."
- Provide a brief outline of your approach
- Mention specific tools or methodologies

**6. Ask Thoughtful Questions:**
- Show you're thinking deeply about the project
- Ask about priorities, preferences, or constraints
- This demonstrates expertise and interest

**7. Pricing:**
- Be transparent about your rates
- Explain the value you provide
- Consider offering different packages

**8. Proofread:**
- Check for typos and grammar
- Ensure clarity and professionalism
- Keep it concise (2-3 paragraphs ideal)

**Pro Tips:**
- Submit proposals within 24 hours of job posting
- Follow up if you don't hear back (but don't be pushy)
- Customize each proposal - never use templates
- Show enthusiasm and confidence

Remember: Quality over quantity. A well-crafted proposal beats 10 generic ones!`,
      tags: ["proposal", "freelancer", "winning"],
      views: 2340,
      helpful: 198,
    },
    {
      id: "7",
      title: "How to hire the perfect freelancer",
      category: "client",
      content: `Finding the right talent is crucial for project success. Follow this guide to hire effectively:

1. **Review Proposals Carefully**:
   - Look for personalized responses, not generic copy-paste templates.
   - Check if they addressed your specific requirements and questions.
   - Review their relevant experience and past project examples.

2. **Check Profiles & Portfolios**:
   - Verify their skills and expertise tags.
   - Look at their portfolio for quality and style compatibility.
   - Read reviews from other clients to gauge reliability and communication.

3. **Interview Candidates**:
   - Shortlist 2-3 top candidates.
   - Schedule a quick chat or video call to discuss the project.
   - Ask about their approach, availability, and communication style.
   - Clarify expectations, deadlines, and deliverables.

4. **Send an Offer**:
   - Once you've selected a freelancer, click "Hire" on their proposal.
   - Define the project scope, milestones, and payment terms clearly.
   - Fund the first milestone to start the contract.

5. **Onboarding**:
   - Share necessary access, files, and brand guidelines immediately.
   - Set up a kickoff meeting or send a detailed briefing message.

Taking time to vet candidates saves time and ensures a smoother project workflow!`,
      tags: ["hiring", "client", "tips"],
      views: 840,
      helpful: 55,
    },
    {
      id: "8",
      title: "Managing projects and milestones",
      category: "client",
      content: `Effective project management ensures timely delivery and high-quality results. Here's how to manage your contracts on HustleX:

**1. Clear Communication**:
- Establish a communication schedule (e.g., weekly updates).
- Use the HustleX chat for all project-related discussions to keep a record.
- Be responsive to freelancer queries to avoid bottlenecks.

**2. Managing Milestones**:
- **Review**: When a freelancer submits work, review it promptly.
- **Feedback**: Provide specific, constructive feedback if revisions are needed.
- **Approval**: Only approve a milestone when you are satisfied with the deliverable.
- **Next Steps**: Activate the next milestone immediately to keep momentum.

**3. Scope Creep**:
- Stick to the original project scope.
- If you need additional work, create a new milestone or bonus payment for the extra tasks.

**4. Ending the Contract**:
- Once all work is completed and paid for, end the contract.
- Leave detailed feedback and a rating—it helps the freelancer and the community.

Organized management leads to happy freelancers and successful projects!`,
      tags: ["management", "milestones", "client"],
      views: 720,
      helpful: 48,
    },
    {
      id: "9",
      title: "Navigating invoices and financial reports",
      category: "billing",
      content: `Keep track of your finances easily with HustleX's billing tools.

**For Clients:**
- **Invoices**: Automatically generated for every payment made.
- **Download**: Access and download PDF invoices from the "Billings & Earnings" section.
- **History**: View your complete transaction history, including deposits, escrow funding, and payments.

**For Freelancers:**
- **Earnings Reports**: Track your income by project, client, or time period.
- **Pending Funds**: View funds currently in escrow or clearing.
- **Withdrawal History**: Keep a record of all your payouts.
- **Tax Info**: Download annual earnings summaries for tax purposes.

**Disputes & Refunds**:
- If a project is cancelled, funds in escrow are returned to the client (subject to dispute resolution).
- Refund invoices are generated for record-keeping.

Maintain good financial records by checking your billing dashboard regularly.`,
      tags: ["billing", "invoices", "finance"],
      views: 650,
      helpful: 42,
    },
    {
      id: "10",
      title: "Search tips: Finding the best jobs",
      category: "using-hustlex",
      content: `Dominate the job search with these advanced tips for freelancers:

1. **Use Filters Effectively**:
   - **Category**: Narrow down to your specific niche (e.g., Web Development > React).
   - **Experience Level**: Filter by Entry, Intermediate, or Expert to match your skills.
   - **Budget**: Set a minimum budget to find high-value projects.
   - **Job Type**: Choose between Fixed-Price or Hourly based on your preference.

2. **Advanced Search**:
   - Use keywords specific to your skills (e.g., "Figma", "Redux", "SEO").
   - Use boolean operators (e.g., "React AND Node" or "Writer NOT Blog") if supported.

3. **Save Searches**:
   - Save your best filter configurations to quickly check for new matching jobs daily.

4. **Check "Newest" First**:
   - Apply early! The first few good proposals often get the most attention.
   - Refresh the feed regularly during business hours in target client time zones.

5. **Read Client History**:
   - Before applying, check the client's rating and reviews from other freelancers.
   - Look for clients with verified payment methods and a history of hiring.

Smart searching saves time and connects you with better clients!`,
      tags: ["search", "jobs", "freelancer"],
      views: 1100,
      helpful: 95,
    },
    {
      id: "11",
      title: "Understanding the Dispute Resolution Process",
      category: "security",
      content: `While rare, disagreements can happen. HustleX provides a structured dispute proccess to ensure fairness.

**When to open a dispute:**
- The freelancer is unresponsive or failed to deliver agreed work.
- The client refuses to release payment for completed work.
- The work delivered is significantly different from the project scope.

**The Process:**
1. **Phase 1: Negotiation**:
   - You open a dispute from the contract page.
   - Both parties discuss the issue in the Dispute Center.
   - Most issues are resolved here by mutual agreement (e.g., partial refund, extended deadline).

2. **Phase 2: Mediation**:
   - If no agreement is reached within 7 days, a HustleX Mediation Specialist joins.
   - The specialist reviews the contract, messages, and work submitted.
   - They propose a non-binding solution based on platform policies.

3. **Phase 3: Arbitration**:
   - If mediation fails, the case can go to final arbitration.
   - A binding decision is made. (Note: fees may apply for arbitration).

**Tips for Success**:
- **Document Everything**: Keep all communication on HustleX.
- **Be Clear**: Define scope and deliverables clearly in the contract.
- **Be Professional**: Remain calm and factual during discussions.

We are here to ensure a fair outcome for everyone.`,
      tags: ["dispute", "security", "protection"],
      views: 530,
      helpful: 120,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: "faq1",
      question: "How do I create an account on HustleX?",
      answer: `Creating an account is simple:
1. Click the "Sign Up" button in the top right corner
2. Choose your role: Freelancer or Client
3. Enter your email address and create a password
4. Verify your email address via the confirmation link
5. Complete your profile with your information, skills, and portfolio
6. Start browsing jobs or posting projects!

The entire process takes less than 5 minutes.`,
      category: "getting-started",
    },


    {
      id: "faq4",
      question: "How do I find the right freelancer for my project?",
      answer: `Finding the perfect freelancer:
1. Post a detailed job description with clear requirements
2. Browse freelancer profiles and portfolios
3. Review ratings, reviews, and completed projects
4. Use filters to narrow down by skills, experience, and rate
5. Send messages to ask questions
6. Review proposals and compare candidates
7. Check their availability and response time
8. Hire the best match for your project

You can also use our "Find Freelancers" feature to search by skills and location.`,
      category: "using-hustlex",
    },
    {
      id: "faq5",
      question: "What if I'm not satisfied with the work?",
      answer: `We have a dispute resolution process:
1. Communicate with the freelancer first to resolve issues
2. Request revisions if the work doesn't meet requirements
3. If unresolved, you can open a dispute
4. Our support team will review the case
5. We'll mediate and find a fair solution

For milestone-based projects, you can request changes before approving a milestone. Always review work carefully before approving payments.`,
      category: "using-hustlex",
    },
    {
      id: "faq6",
      question: "How do I increase my chances of getting hired?",
      answer: `Boost your profile visibility:
1. Complete your profile 100% with all sections filled
2. Add a professional photo and compelling overview
3. Showcase your best work in your portfolio
4. Get verified badges (skills tests, identity verification)
5. Collect positive reviews from completed projects
6. Respond to messages quickly (within 24 hours)
7. Submit quality proposals tailored to each job
8. Keep your availability status updated
9. Maintain a high job success score
10. Specialize in specific skills rather than being a generalist

Active freelancers with complete profiles get 3x more job invitations!`,
      category: "freelancer",
    },
    {
      id: "faq7",
      question: "Is my payment information secure?",
      answer: `Yes, absolutely! We use industry-standard security measures:
- All payment data is encrypted using SSL/TLS
- We comply with PCI DSS standards
- Payment information is never stored on our servers
- We use trusted payment processors
- Two-factor authentication available
- Regular security audits and updates

Your financial information is protected with bank-level security. We never share your payment details with freelancers or clients.`,
      category: "security",
    },
    {
      id: "faq8",
      question: "Can I work on multiple projects at once?",
      answer: `Yes! You can work on multiple projects simultaneously:
- There's no limit on active projects
- Manage all projects from your dashboard
- Set your availability to show when you're available
- Use the calendar to track deadlines
- Communicate with multiple clients efficiently

However, make sure you can deliver quality work on time for all projects. Overcommitting can hurt your reputation and ratings.`,
      category: "freelancer",
    },
  ];

  const tutorials = [
    {
      id: "tut1",
      title: "Getting Started with HustleX",
      duration: "5:30",
      category: "getting-started",
    },
    {
      id: "tut2",
      title: "Creating Your Freelancer Profile",
      duration: "8:15",
      category: "getting-started",
    },
    {
      id: "tut3",
      title: "How to Post Your First Job",
      duration: "6:45",
      category: "using-hustlex",
    },
    {
      id: "tut4",
      title: "Writing Winning Proposals",
      duration: "10:20",
      category: "freelancer",
    },
    {
      id: "tut5",
      title: "Understanding Payments & Milestones",
      duration: "7:10",
      category: "billing",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesQuery =
      query === "" ||
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const filteredFAQs = faqs.filter((faq) => {
    const matchesQuery =
      query === "" ||
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <>
      <HelpCenterSEO />
      <div className={`relative min-h-screen ${darkMode ? "bg-black" : "bg-white"}`}>
      <AnimatePresence>
        {isLoaded && (
          <>
            {/* Hero Section */}
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`pt-20 pb-12 px-6 ${darkMode ? "bg-gradient-to-b from-black to-gray-900" : "bg-gradient-to-b from-white to-gray-50"}`}
            >
              <div className="max-w-7xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className={`text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-black"}`}>
                    {t.helpCenter.title}
                  </h1>
                  <p className={`text-lg sm:text-xl ${darkMode ? "text-white/80" : "text-black/70"} max-w-3xl mx-auto mb-8`}>
                    {t.helpCenter.subtitle}
                  </p>
                </motion.div>

                {/* Enhanced Search Bar */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mt-8 max-w-3xl mx-auto"
                >
                  <div
                    className={`flex items-center gap-4 rounded-2xl p-4 border-2 shadow-lg ${darkMode
                      ? "bg-black/60 border-cyan-500/30 focus-within:border-cyan-500"
                      : "bg-white border-cyan-200 focus-within:border-cyan-500"
                      } transition-colors`}
                  >
                    <FaSearch className={`text-xl ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search articles, FAQs, tutorials, or topics..."
                      className={`flex-1 outline-none bg-transparent text-lg ${darkMode
                        ? "text-white placeholder:text-white/50"
                        : "text-black placeholder:text-black/50"
                        }`}
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className={`px-3 py-1 rounded-lg ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"}`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className={`text-sm mt-3 ${darkMode ? "text-white/60" : "text-black/60"}`}>
                    {filteredArticles.length + filteredFAQs.length} results found
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* Category Filter */}
            {query && (
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4"
              >
                <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory
                      ? "bg-cyan-600 text-white"
                      : darkMode
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-black/10 text-black hover:bg-black/20"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id
                        ? "bg-cyan-600 text-white"
                        : darkMode
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-black/10 text-black hover:bg-black/20"
                        }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Categories Grid */}
            {!query && !selectedCategory && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="px-6 py-12"
              >
                <div className="max-w-7xl mx-auto">
                  <h2 className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${darkMode ? "text-white" : "text-black"}`}>
                    Browse by Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setQuery("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`p-6 rounded-2xl border cursor-pointer group transition-all ${darkMode
                          ? "bg-black/50 border-white/10 hover:border-cyan-500/50 hover:bg-black/70"
                          : "bg-white border-black/10 hover:border-cyan-500/50 hover:bg-gray-50"
                          } shadow-lg hover:shadow-xl`}
                      >
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${cat.color} text-white text-xl group-hover:scale-110 transition-transform`}
                        >
                          {cat.icon}
                        </div>
                        <h3 className={`font-bold text-xl mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                          {cat.title}
                        </h3>
                        <p className={`${darkMode ? "text-white/70" : "text-black/70"}`}>{cat.desc}</p>
                        <div className="mt-4 flex items-center gap-2 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">Explore</span>
                          <FaArrowRight className="text-xs" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Search Results - Articles */}
            {(query || selectedCategory) && filteredArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-8"
              >
                {selectedCategory && !query && (
                  <div className="max-w-7xl mx-auto mb-8">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`flex items-center gap-2 mb-4 text-sm font-medium ${darkMode ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"
                        }`}
                    >
                      <FaArrowRight className="rotate-180" /> Back to Categories
                    </button>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? "bg-white/10" : "bg-black/5"}`}>
                        {categories.find(c => c.id === selectedCategory)?.icon}
                      </div>
                      <div>
                        <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
                          {categories.find(c => c.id === selectedCategory)?.title}
                        </h2>
                        <p className={`${darkMode ? "text-white/70" : "text-black/70"}`}>
                          {categories.find(c => c.id === selectedCategory)?.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="max-w-7xl mx-auto">
                  <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${darkMode ? "text-white" : "text-black"}`}>
                    Articles ({filteredArticles.length})
                  </h2>
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border overflow-hidden ${darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white border-black/10"
                          } shadow-lg`}
                      >
                        <div
                          className={`p-6 cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"
                            } transition-colors`}
                          onClick={() => toggleArticle(article.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FaBookOpen className={`${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode
                                    ? "bg-cyan-500/20 text-cyan-400"
                                    : "bg-cyan-100 text-cyan-700"
                                    }`}
                                >
                                  {
                                    categories.find((c) => c.id === article.category)
                                      ?.title
                                  }
                                </span>
                              </div>
                              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                                {article.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm">
                                <span className={`${darkMode ? "text-white/60" : "text-black/60"}`}>
                                  <FaClock className="inline mr-1" />
                                  {article.views} {t.helpCenter.views}
                                </span>
                                <span className={`${darkMode ? "text-white/60" : "text-black/60"}`}>
                                  <FaCheckCircle className="inline mr-1" />
                                  {article.helpful} helpful
                                </span>
                              </div>
                            </div>
                            <button className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10" : "hover:bg-black/10"}`}>
                              {expandedArticle === article.id ? (
                                <FaChevronUp className={darkMode ? "text-white" : "text-black"} />
                              ) : (
                                <FaChevronDown className={darkMode ? "text-white" : "text-black"} />
                              )}
                            </button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedArticle === article.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div
                                className={`px-6 pb-6 border-t ${darkMode ? "border-white/10 bg-black/30" : "border-black/10 bg-gray-50"
                                  }`}
                              >
                                <div className={`mt-4 ${darkMode ? "text-white/90" : "text-black/90"} leading-relaxed whitespace-pre-line`}>
                                  {article.content}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {article.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={`px-3 py-1 rounded-full text-xs ${darkMode
                                        ? "bg-white/10 text-white/80"
                                        : "bg-black/10 text-black/80"
                                        }`}
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Popular Articles (when no search and no category selected) */}
            {!query && !selectedCategory && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="px-6 py-12"
              >
                <div className="max-w-7xl mx-auto">
                  <h2 className={`text-3xl sm:text-4xl font-bold mb-8 ${darkMode ? "text-white" : "text-black"}`}>
                    {t.helpCenter.popularArticles}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.slice(0, 4).map((article, i) => (
                      <motion.div
                        key={article.id}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        onClick={() => toggleArticle(article.id)}
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${darkMode
                          ? "bg-black/50 border-white/10 hover:border-cyan-500/50 hover:bg-black/70"
                          : "bg-white border-black/10 hover:border-cyan-500/50 hover:bg-gray-50"
                          } shadow-lg hover:shadow-xl`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                              }`}
                          >
                            <FaBookOpen />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`${darkMode ? "text-white/60" : "text-black/60"}`}>
                                <FaStar className="inline mr-1 text-yellow-500" />
                                Popular
                              </span>
                              <span className={`${darkMode ? "text-white/60" : "text-black/60"}`}>
                                {article.views} {t.helpCenter.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* FAQs Section */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="px-6 py-12"
            >
              <div className="max-w-7xl mx-auto">
                <h2 className={`text-3xl sm:text-4xl font-bold mb-8 ${darkMode ? "text-white" : "text-black"}`}>
                  {(query || selectedCategory) ? `${t.helpCenter.frequentlyAskedQuestions} (${filteredFAQs.length})` : t.helpCenter.frequentlyAskedQuestions}
                </h2>
                <div className="space-y-4">
                  {((query || selectedCategory) ? filteredFAQs : faqs).map((faq, i) => (
                    <motion.div
                      key={faq.id}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className={`rounded-xl border overflow-hidden ${darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                        } shadow-lg`}
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className={`w-full p-6 text-left flex items-center justify-between gap-4 ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"
                          } transition-colors`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <FaQuestionCircle
                            className={`text-xl mt-1 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}
                          />
                          <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-black"}`}>
                            {faq.question}
                          </h3>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <FaChevronUp className={`flex-shrink-0 ${darkMode ? "text-white" : "text-black"}`} />
                        ) : (
                          <FaChevronDown className={`flex-shrink-0 ${darkMode ? "text-white" : "text-black"}`} />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div
                              className={`px-6 pb-6 pl-14 border-t ${darkMode ? "border-white/10 bg-black/30" : "border-black/10 bg-gray-50"
                                }`}
                            >
                              <p className={`${darkMode ? "text-white/90" : "text-black/90"} leading-relaxed whitespace-pre-line`}>
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Video Tutorials */}
            {!query && !selectedCategory && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="px-6 py-12"
              >
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className={`text-3xl sm:text-4xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
                      Video Tutorials
                    </h2>
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium ${darkMode
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-black/10 text-black hover:bg-black/20"
                        } transition`}
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((tut, i) => (
                      <motion.div
                        key={tut.id}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className={`rounded-xl border overflow-hidden ${darkMode
                          ? "bg-black/50 border-white/10 hover:border-cyan-500/50"
                          : "bg-white border-black/10 hover:border-cyan-500/50"
                          } shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                      >
                        <div
                          className={`h-48 flex items-center justify-center bg-gradient-to-br ${categories.find((c) => c.id === tut.category)?.color || "from-gray-500 to-gray-600"
                            } relative`}
                        >
                          <FaPlayCircle className="text-6xl text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            {tut.duration}
                          </div>
                        </div>
                        <div className="p-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block ${darkMode
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-cyan-100 text-cyan-700"
                              }`}
                          >
                            {
                              categories.find((c) => c.id === tut.category)
                                ?.title
                            }
                          </span>
                          <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-black"}`}>
                            {tut.title}
                          </h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Contact Support Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="px-6 pb-16"
            >
              <div className="max-w-7xl mx-auto">
                <div
                  className={`p-8 sm:p-12 rounded-2xl border text-center ${darkMode
                    ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10"
                    : "bg-gradient-to-br from-cyan-50 to-blue-50 border-black/10"
                    } shadow-xl`}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaLifeRing className={`text-5xl mx-auto mb-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                    <h3 className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
                      Still need help?
                    </h3>
                    <p className={`text-lg ${darkMode ? "text-white/80" : "text-black/70"} mb-8 max-w-2xl mx-auto`}>
                      Our support team is here to help you 24/7. Contact us through any of these channels.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/contact-us")}
                        className="px-8 py-4 rounded-full font-semibold bg-cyan-600 hover:bg-cyan-700 text-white inline-flex items-center justify-center gap-3 shadow-lg"
                      >
                        <FaEnvelope /> Contact Support
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/faq")}
                        className={`px-8 py-4 rounded-full font-semibold inline-flex items-center justify-center gap-3 shadow-lg ${darkMode
                          ? "bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
                          : "bg-black/10 hover:bg-black/20 text-black border-2 border-black/20"
                          } transition`}
                      >
                        <FaQuestionCircle /> View FAQ
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-white/80"}`}>
                        <FaEnvelope className={`text-2xl mb-2 mx-auto ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                        <p className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-black"}`}>Email</p>
                        <p className={`text-sm ${darkMode ? "text-white/70" : "text-black/70"}`}>
                          support@hustlex.com
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-white/80"}`}>
                        <FaClock className={`text-2xl mb-2 mx-auto ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                        <p className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-black"}`}>Response Time</p>
                        <p className={`text-sm ${darkMode ? "text-white/70" : "text-black/70"}`}>
                          Within 24 hours
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-white/80"}`}>
                        <FaCheckCircle className={`text-2xl mb-2 mx-auto ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                        <p className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-black"}`}>Available</p>
                        <p className={`text-sm ${darkMode ? "text-white/70" : "text-black/70"}`}>24/7 Support</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default HelpCenter;
