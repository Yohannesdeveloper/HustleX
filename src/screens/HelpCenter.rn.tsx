/**
 * React Native HelpCenter Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

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
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = [
    {
      id: "getting-started",
      icon: "person",
      title: t.helpCenter?.gettingStarted || "Getting Started",
      desc: t.helpCenter?.gettingStartedDesc || "Learn the basics",
      color: "#3b82f6",
    },
    {
      id: "using-hustlex",
      icon: "briefcase",
      title: t.helpCenter?.usingHustleX || "Using HustleX",
      desc: t.helpCenter?.usingHustleXDesc || "Platform features",
      color: "#a855f7",
    },
    {
      id: "billing",
      icon: "card",
      title: t.helpCenter?.billingPayments || "Billing & Payments",
      desc: t.helpCenter?.billingPaymentsDesc || "Payment info",
      color: "#10b981",
    },
    {
      id: "security",
      icon: "shield-checkmark",
      title: t.helpCenter?.securitySafety || "Security & Safety",
      desc: t.helpCenter?.securitySafetyDesc || "Stay secure",
      color: "#ef4444",
    },
    {
      id: "freelancer",
      icon: "rocket",
      title: t.helpCenter?.freelancerSuccess || "Freelancer Success",
      desc: t.helpCenter?.freelancerSuccessDesc || "Grow your career",
      color: "#f59e0b",
    },
    {
      id: "client",
      icon: "business",
      title: t.helpCenter?.forClients || "For Clients",
      desc: t.helpCenter?.forClientsDesc || "Hire talent",
      color: "#6366f1",
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
      id: "faq2",
      question: "How does the payment system work?",
      answer: `HustleX uses a secure escrow system:
1. Client funds the project into escrow
2. Project is divided into milestones
3. Freelancer completes work for each milestone
4. Client reviews and approves the work
5. Payment is released to the freelancer
6. Freelancer can withdraw funds to their bank account

All payments are secure and protected. We support multiple payment methods including credit cards, bank transfers, and mobile money.`,
      category: "billing",
    },
    {
      id: "faq3",
      question: "What fees does HustleX charge?",
      answer: `HustleX charges a service fee:
- For Freelancers: 10% service fee on completed projects
- For Clients: No additional fees beyond the project cost

The service fee helps us maintain the platform, provide customer support, and ensure secure transactions. All fees are clearly displayed before you accept a project or hire a freelancer.`,
      category: "billing",
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#FFFFFF",
    },
    scrollContent: {
      padding: 24,
    },
    heroSection: {
      paddingTop: 20,
      paddingBottom: 48,
      alignItems: "center",
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 16,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    heroSubtitle: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 32,
      color: darkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "#FFFFFF",
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 2,
      borderColor: darkMode ? "rgba(6,182,212,0.3)" : "rgba(6,182,212,0.2)",
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: darkMode ? "#FFFFFF" : "#000000",
      marginLeft: 8,
    },
    searchResults: {
      fontSize: 14,
      color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      marginBottom: 16,
    },
    categoryFilter: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    categoryButtonActive: {
      backgroundColor: "#0891b2",
    },
    categoryButtonInactive: {
      backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    categoryButtonTextInactive: {
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 32,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 48,
    },
    categoryCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    categoryIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    categoryCardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    categoryCardDesc: {
      fontSize: 14,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
    articleCard: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    articleHeader: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    articleInfo: {
      flex: 1,
    },
    articleCategory: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    articleCategoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontWeight: "600",
    },
    articleTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    articleMeta: {
      flexDirection: "row",
      gap: 16,
      fontSize: 12,
      color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    },
    articleContent: {
      padding: 16,
      paddingTop: 0,
      color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
      fontSize: 14,
      lineHeight: 20,
    },
    articleTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    articleTag: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      color: darkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
    },
    faqItem: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    faqButton: {
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    faqAnswer: {
      padding: 16,
      paddingTop: 0,
      color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
      fontSize: 14,
      lineHeight: 20,
    },
    tutorialCard: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    tutorialThumbnail: {
      height: 192,
      backgroundColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    tutorialDuration: {
      position: "absolute",
      bottom: 12,
      right: 12,
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "#FFFFFF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 12,
    },
    tutorialContent: {
      padding: 16,
    },
    tutorialCategory: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
    },
    tutorialTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    supportSection: {
      backgroundColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      marginTop: 48,
    },
    supportTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 16,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    supportText: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      color: darkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
    },
    supportButtons: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    supportButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    supportButtonPrimary: {
      backgroundColor: "#0891b2",
    },
    supportButtonSecondary: {
      backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      borderWidth: 2,
      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
    },
    supportButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
    supportButtonTextSecondary: {
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    supportInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "center",
    },
    supportInfoCard: {
      flex: 1,
      minWidth: "30%",
      padding: 16,
      borderRadius: 12,
      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
      alignItems: "center",
    },
    supportInfoIcon: {
      marginBottom: 8,
    },
    supportInfoTitle: {
      fontWeight: "600",
      marginBottom: 4,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    supportInfoText: {
      fontSize: 12,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeIn} style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {t.helpCenter?.title || "Help Center"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t.helpCenter?.subtitle || "Find answers to your questions"}
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={darkMode ? "#22d3ee" : "#0891b2"}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t.helpCenter?.searchPlaceholder || "Search articles, FAQs, tutorials..."}
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={styles.searchInput}
            />
            {query !== "" && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={20} color={darkMode ? "#FFFFFF" : "#000000"} />
              </TouchableOpacity>
            )}
          </View>
          {query !== "" && (
            <Text style={styles.searchResults}>
              {filteredArticles.length + filteredFAQs.length} results found
            </Text>
          )}
        </Animated.View>

        {/* Category Filter */}
        {query !== "" && (
          <View style={styles.categoryFilter}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory ? styles.categoryButtonActive : styles.categoryButtonInactive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={
                  !selectedCategory
                    ? styles.categoryButtonText
                    : styles.categoryButtonTextInactive
                }
              >
                {t.helpCenter?.allCategories || "All Categories"}
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id
                    ? styles.categoryButtonActive
                    : styles.categoryButtonInactive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={
                    selectedCategory === cat.id
                      ? styles.categoryButtonText
                      : styles.categoryButtonTextInactive
                  }
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Categories Grid */}
        {!query && (
          <Animated.View entering={FadeIn.delay(200)}>
            <Text style={styles.sectionTitle}>
              {t.helpCenter?.browseByCategory || "Browse by Category"}
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat, i) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setQuery("");
                  }}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: cat.color + "20" },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                  </View>
                  <Text style={styles.categoryCardTitle}>{cat.title}</Text>
                  <Text style={styles.categoryCardDesc}>{cat.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Search Results - Articles */}
        {query !== "" && filteredArticles.length > 0 && (
          <Animated.View entering={FadeIn}>
            <Text style={styles.sectionTitle}>
              Articles ({filteredArticles.length})
            </Text>
            {filteredArticles.map((article) => (
              <Animated.View
                key={article.id}
                entering={FadeIn.delay(100)}
                style={styles.articleCard}
              >
                <TouchableOpacity
                  style={styles.articleHeader}
                  onPress={() => toggleArticle(article.id)}
                >
                  <View style={styles.articleInfo}>
                    <View style={styles.articleCategory}>
                      <Ionicons
                        name="book"
                        size={16}
                        color={darkMode ? "#22d3ee" : "#0891b2"}
                      />
                      <Text
                        style={[
                          styles.articleCategoryBadge,
                          {
                            backgroundColor: darkMode
                              ? "rgba(6,182,212,0.2)"
                              : "rgba(6,182,212,0.1)",
                            color: darkMode ? "#22d3ee" : "#0891b2",
                          },
                        ]}
                      >
                        {categories.find((c) => c.id === article.category)?.title}
                      </Text>
                    </View>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <View style={styles.articleMeta}>
                      <Text>
                        <Ionicons name="time" size={12} /> {article.views}{" "}
                        {t.helpCenter?.views || "views"}
                      </Text>
                      <Text>
                        <Ionicons name="checkmark-circle" size={12} /> {article.helpful} helpful
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expandedArticle === article.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={darkMode ? "#FFFFFF" : "#000000"}
                  />
                </TouchableOpacity>
                {expandedArticle === article.id && (
                  <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View style={styles.articleContent}>
                      <Text>{article.content}</Text>
                      <View style={styles.articleTags}>
                        {article.tags.map((tag) => (
                          <Text key={tag} style={styles.articleTag}>
                            #{tag}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Popular Articles */}
        {!query && (
          <Animated.View entering={FadeIn.delay(400)}>
            <Text style={styles.sectionTitle}>
              {t.helpCenter?.popularArticles || "Popular Articles"}
            </Text>
            {articles.slice(0, 4).map((article, i) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => toggleArticle(article.id)}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleInfo}>
                    <View
                      style={[
                        styles.articleCategoryBadge,
                        {
                          backgroundColor: darkMode
                            ? "rgba(6,182,212,0.2)"
                            : "rgba(6,182,212,0.1)",
                          color: darkMode ? "#22d3ee" : "#0891b2",
                        },
                      ]}
                    >
                      <Ionicons name="star" size={12} color="#f59e0b" /> Popular
                    </View>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <View style={styles.articleMeta}>
                      <Text>{article.views} {t.helpCenter?.views || "views"}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* FAQs Section */}
        <Animated.View entering={FadeIn.delay(600)}>
          <Text style={styles.sectionTitle}>
            {query
              ? `${t.helpCenter?.frequentlyAskedQuestions || "Frequently Asked Questions"} (${filteredFAQs.length})`
              : t.helpCenter?.frequentlyAskedQuestions || "Frequently Asked Questions"}
          </Text>
          {(query ? filteredFAQs : faqs).map((faq, i) => (
            <Animated.View
              key={faq.id}
              entering={FadeIn.delay(i * 50)}
              style={styles.faqItem}
            >
              <TouchableOpacity
                style={styles.faqButton}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Ionicons
                  name="help-circle"
                  size={20}
                  color={darkMode ? "#22d3ee" : "#0891b2"}
                />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={darkMode ? "#FFFFFF" : "#000000"}
                />
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </Animated.View>
              )}
            </Animated.View>
          ))}
        </Animated.View>

        {/* Video Tutorials */}
        {!query && (
          <Animated.View entering={FadeIn.delay(800)}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <Text style={styles.sectionTitle}>Video Tutorials</Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: darkMode ? "#FFFFFF" : "#000000",
                  }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {tutorials.map((tut, i) => (
                <TouchableOpacity
                  key={tut.id}
                  style={[styles.tutorialCard, { flex: 1, minWidth: "45%" }]}
                >
                  <View style={styles.tutorialThumbnail}>
                    <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                    <Text style={styles.tutorialDuration}>{tut.duration}</Text>
                  </View>
                  <View style={styles.tutorialContent}>
                    <Text
                      style={[
                        styles.tutorialCategory,
                        {
                          backgroundColor: darkMode
                            ? "rgba(6,182,212,0.2)"
                            : "rgba(6,182,212,0.1)",
                          color: darkMode ? "#22d3ee" : "#0891b2",
                        },
                      ]}
                    >
                      {categories.find((c) => c.id === tut.category)?.title}
                    </Text>
                    <Text style={styles.tutorialTitle}>{tut.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Contact Support Section */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.supportSection}>
          <Ionicons
            name="help-circle"
            size={48}
            color={darkMode ? "#22d3ee" : "#0891b2"}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>
            Our support team is here to help you 24/7. Contact us through any of these channels.
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={[styles.supportButton, styles.supportButtonPrimary]}
              onPress={() => navigation.navigate("ContactUs" as never)}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.supportButton, styles.supportButtonSecondary]}
              onPress={() => navigation.navigate("FAQ" as never)}
            >
              <Ionicons
                name="help-circle"
                size={20}
                color={darkMode ? "#FFFFFF" : "#000000"}
              />
              <Text style={styles.supportButtonTextSecondary}>View FAQ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.supportInfo}>
            <View style={styles.supportInfoCard}>
              <Ionicons
                name="mail"
                size={24}
                color={darkMode ? "#22d3ee" : "#0891b2"}
                style={styles.supportInfoIcon}
              />
              <Text style={styles.supportInfoTitle}>Email</Text>
              <Text style={styles.supportInfoText}>support@hustlexet.com</Text>
            </View>
            <View style={styles.supportInfoCard}>
              <Ionicons
                name="time"
                size={24}
                color={darkMode ? "#22d3ee" : "#0891b2"}
                style={styles.supportInfoIcon}
              />
              <Text style={styles.supportInfoTitle}>Response Time</Text>
              <Text style={styles.supportInfoText}>Within 24 hours</Text>
            </View>
            <View style={styles.supportInfoCard}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={darkMode ? "#22d3ee" : "#0891b2"}
                style={styles.supportInfoIcon}
              />
              <Text style={styles.supportInfoTitle}>Available</Text>
              <Text style={styles.supportInfoText}>24/7 Support</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default HelpCenter;
