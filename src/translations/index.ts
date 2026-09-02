import { Language } from "../store/languageSlice";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    aboutUs: string;
    exploreJobs: string;
    pricing: string;
    blog: string;
    faq: string;
    howItWorks: string;
    contact: string;
    findFreelancers: string;
    logIn: string;
    signUp: string;
  };

  // Hero Section
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    subtitleHighlight: string;
    getStarted: string;
    findTalent: string;
    joinAsFreelancer: string;
  };

  // Features
  features: {
    title: string;
    subtitle: string;
    postJobs: { title: string; desc: string };
    findTalent: { title: string; desc: string };
    securePayments: { title: string; desc: string };
    realTimeChat: { title: string; desc: string };
  };

  // Categories
  categories: {
    title: string;
    subtitle: string;
    freelancers: string;
    popularCategories: string;
    development: string;
    design: string;
    marketing: string;
    mobile: string;
    writing: string;
    translation: string;
    business: string;
    consulting: string;
    adminSupport: string;
    eliteFreelancers: string;
  };

  // Testimonials
  testimonials: {
    title: string;
    subtitle: string;
    list: Array<{ quote: string; name: string; role: string }>;
  };
  featuredFreelancers: {
    title: string;
    yohannes: { name: string; title: string; rate: string };
    samuel: { name: string; title: string; rate: string };
    messi: { name: string; title: string; rate: string };
    lily: { name: string; title: string; rate: string };
  };

  // CTA Section
  cta: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    getStarted: string;
    learnMore: string;
    findDreamWork: string;
  };

  // Footer
  footer: {
    description: string;
    quickLinks: string;
    resources: string;
    followUs: string;
    allRightsReserved: string;
    forClients: string;
    forFreelancers: string;
    company: string;
    howToHire: string;
    talentMarketplace: string;
    howToFindWork: string;
    freelanceJobs: string;
    aboutUs: string;
    careers: string;
    contactUs: string;
    helpCenter: string;
    blog: string;
    community: string;
    api: string;
    madeWith: string;
    inEthiopia: string;
  };

  // How It Works
  howItWorks: {
    title: string;
    subtitle: string;
    videoSubtitle: string;
    steps: {
      signUp: { title: string; desc: string };
      browse: { title: string; desc: string };
      connect: { title: string; desc: string };
      succeed: { title: string; desc: string };
    };
  };

  // Companies
  companies: {
    trustedBy: string;
    companies: string;
  };

  // Common
  common: {
    language: string;
    darkMode: string;
    loading: string;
    error: string;
    success: string;
  };

  // Payment
  payment: {
    backToPricing: string;
    completePayment: string;
    choosePaymentMethod: string;
    payWithTelebirr: string;
    phoneNumber: string;
    enterPhoneNumber: string;
    enterPhoneNumberPlaceholder: string;
    continue: string;
    paymentRequestSent: string;
    paymentRequestSentTo: string;
    checkPhoneAndEnterPin: string;
    waitingForConfirmation: string;
    paymentSuccessful: string;
    subscriptionActivated: string;
    redirectingToDashboard: string;
    planSummary: string;
    mobileMoneyPayment: string;
    back: string;
    stepPhoneNumber: string;
    stepPaymentProcess: string;
    stepConfirmation: string;
  };

  // Stats
  stats: {
    happyClients: string;
    successProjects: string;
    projectsCompleted: string;
    successRate: string;
  };

  // Help Center
  helpCenter: {
    title?: string;
    subtitle?: string;
    searchPlaceholder: string;
    gettingStarted: string;
    gettingStartedDesc: string;
    usingHustleX: string;
    usingHustleXDesc: string;
    billingPayments: string;
    billingPaymentsDesc: string;
    securitySafety: string;
    securitySafetyDesc: string;
    freelancerSuccess: string;
    freelancerSuccessDesc: string;
    forClients: string;
    forClientsDesc: string;
    popularArticles: string;
    allCategories: string;
    browseByCategory?: string;
    frequentlyAskedQuestions?: string;
    views: string;
    helpful: string;
    readMore: string;
    backToHelpCenter: string;
    noResultsFound: string;
    tryDifferentSearch: string;
  };

  // About Us
  aboutUs: {
    activeFreelancers: string;
    ourStory: string;
    ourStoryDescription: string;
    ourMission: string;
    ourMissionDescription: string;
    ourValues: string;
    innovation: string;
    innovationDesc: string;
    community: string;
    communityDesc: string;
    excellence: string;
    excellenceDesc: string;
    globalReach: string;
    globalReachDesc: string;
    meetOurTeam: string;
    meetOurFounder: string;
    visionarySubtitle: string;
    founder: string;
    founderName: string;
    founderBio: string;
    founderCEO: string;
    frontendDeveloper: string;
    fullstackDeveloper: string;
    visionaryLeaderBio: string;
    frontendDeveloperBio: string;
    fullstackDeveloperBio: string;
  };

  // Signup
  signup: {
    createAccount: string;
    welcomeBack: string;
    loginToContinue: string;
    joinHustleX: string;
    freelancer: string;
    client: string;
    signUp: string;
    signUpWithGoogle: string;
    signUpWithApple: string;
    comingSoon: string;
    useYourEmail: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    iWantTo: string;
    findWork: string;
    hireFreelancers: string;
    creatingAccount: string;
    alreadyHaveAccount: string;
    signIn: string;
    forgotPassword: string;
    signingIn: string;
    accountFound: string;
    accountExistsMessage: string;
    continueWithExistingRole: string;
    account: string;
    orAddNewRole: string;
    addFreelancerRole: string;
    offerServices: string;
    add: string;
    addClientRole: string;
    hireFreelancersAndPost: string;
    backToAccountSelection: string;
    signInToAddRole: string;
    signInToContinue: string;
    pleaseEnterPassword: string;
    passwordsDoNotMatch: string;
    passwordRequirements: string;
    accountAlreadyExists: string;
    failedToCreateAccount: string;
    tooManyRequests: string;
    invalidEmailOrPassword: string;
    googleSignupFailed: string;
    googleSignupComingSoon: string;
  };

  // Login
  login: {
    login: string;
    signInWithGoogle: string;
    signInWithApple: string;
    comingSoon: string;
    useYourEmail: string;
    email: string;
    password: string;
    forgotPassword: string;
    signingIn: string;
    signIn: string;
    dontHaveAccount: string;
    signUp: string;
    incorrectEmailOrPassword: string;
    googleLoginFailed: string;
    googleLoginComingSoon: string;
    failedToAddRole: string;
  };

  // PostJob
  postJob: {
    postAJob: string;
    createJobListing: string;
    checkingAuthentication: string;
    jobTitle: string;
    enterJobTitle: string;
    companyName: string;
    enterCompanyName: string;
    category: string;
    selectCategory: string;
    jobType: string;
    selectJobType: string;
    experienceLevel: string;
    selectExperience: string;
    salaryRange: string;
    enterSalaryRange: string;
    description: string;
    enterDescription: string;
    deadline: string;
    selectDeadline: string;
    workLocation: string;
    selectWorkLocation: string;
    skills: string;
    selectSkills: string;
    gender: string;
    selectGender: string;
    vacancies: string;
    enterVacancies: string;
    address: string;
    enterAddress: string;
    country: string;
    selectCountry: string;
    city: string;
    enterCity: string;
    jobLink: string;
    enterJobLink: string;
    visibility: string;
    public: string;
    private: string;
    postJob: string;
    posting: string;
    errorPostingJob: string;
    lifetimeLimitReached: string;
    upgradeToPostMore: string;
    upgradePlan: string;
    required: string;
  };

  // FAQ
  faq: {
    whatIsHustleX: string;
    whatIsHustleXAnswer: string;
    howDoIGetStartedAsFreelancer: string;
    howDoIGetStartedAsFreelancerAnswer: string;
    howDoIPostJobAsClient: string;
    howDoIPostJobAsClientAnswer: string;
    whatAreTheFees: string;
    whatAreTheFeesAnswer: string;
    whatCategoriesAvailable: string;
    whatCategoriesAvailableAnswer: string;
    howDoICommunicate: string;
    howDoICommunicateAnswer: string;
    whatIfNotSatisfied: string;
    whatIfNotSatisfiedAnswer: string;
    canIWorkInternationally: string;
    canIWorkInternationallyAnswer: string;
    isCustomerSupportAvailable: string;
    isCustomerSupportAvailableAnswer: string;
    gotQuestions: string;
    gotAnswers: string;
    contactSupportDesc: string;
    stillHaveQuestions: string;
    howRatePlatform: string;
    howRatePlatformAnswer: string;
    contactSupport: string;
    visitHelpCenter: string;
  };

  // Contact Us
  contactUs: {
    getInTouch: string;
    getInTouchWith: string;
    haveQuestions: string;
    phone: string;
    email: string;
    office: string;
    businessHours: string;
    monFriHours: string;
    respondWithin24Hours: string;
    weekendSupportAvailable: string;
    sendUsMessage: string;
    fullName: string;
    emailAddress: string;
    subject: string;
    message: string;
    selectSubject: string;
    generalInquiry: string;
    technicalSupport: string;
    partnership: string;
    billingPayments: string;
    feedback: string;
    other: string;
    yourFullName: string;
    yourEmailPlaceholder: string;
    tellUsHowWeCanHelp: string;
    sending: string;
    sendMessage: string;
    visitOurOffice: string;
    hustleXHQ: string;
    officeLocationDescription: string;
    openInGoogleMaps: string;
    followUs: string;
    needQuickAnswers: string;
    checkOutFAQ: string;
    visitFAQ: string;
    validationFailed: string;
    failedToSendMessage: string;
    failedToSendMessageCheckConnection: string;
  };

  // Pricing
  pricing: {
    chooseYourPlan: string;
    plan: string;
    selectPerfectPlan: string;
    startFreeOrUpgrade: string;
    freeTrial: string;
    basicPlan: string;
    premiumPlan: string;
    forever: string;
    perMonth: string;
    perfectForGettingStarted: string;
    forGrowingBusinesses: string;
    forEnterpriseNeeds: string;
    mostPopular: string;
    getStarted: string;
    choosePlan: string;
    postUpTo3JobsLifetime: string;
    multiPlatformPosting: string;
    browseFreelancerProfiles: string;
    basicMessaging: string;
    standardSupport: string;
    accessToJobListings: string;
    postUpTo10JobsPerMonth: string;
    unlimitedFreelancerBrowsing: string;
    priorityMessaging: string;
    prioritySupport: string;
    advancedSearchFilters: string;
    jobAnalyticsDashboard: string;
    featuredJobListings: string;
    unlimitedJobPosts: string;
    unlimitedFreelancerAccess: string;
    premiumMessagingVideoCalls: string;
    dedicatedSupport: string;
    advancedAnalyticsInsights: string;
    featuredPromotedListings: string;
    customBrandingOptions: string;
    apiAccess: string;
    dedicatedAccountManager: string;
    earlyAccessToNewFeatures: string;
    frequentlyAskedQuestions: string;
    canIChangePlansLater: string;
    canIChangePlansLaterAnswer: string;
    whatPaymentMethodsDoYouAccept: string;
    whatPaymentMethodsDoYouAcceptAnswer: string;
    isThereAContract: string;
    isThereAContractAnswer: string;
    doYouOfferRefunds: string;
    doYouOfferRefundsAnswer: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      aboutUs: "About Us",
      exploreJobs: "Explore Jobs",
      pricing: "Pricing",
      blog: "Blog",
      faq: "FAQ",
      howItWorks: "How it works",
      contact: "Contact",
      findFreelancers: "Find Freelancers",
      logIn: "Log In",
      signUp: "Sign Up",
    },
    hero: {
      title: "Work smarter.",
      titleHighlight: "Hustle faster.",
      subtitle: "Connecting businesses with top Ethiopian talent",
      subtitleHighlight: "across 200+ skills.",
      getStarted: "Get Started",
      findTalent: "Find Talent",
      joinAsFreelancer: "Join as Freelancer",
    },
    features: {
      title: "Why Choose HustleX?",
      subtitle: "Everything you need to succeed in the freelance marketplace",
      postJobs: {
        title: "Post Jobs Easily",
        desc: "Create and publish job listings in minutes. Find the perfect freelancer for your project.",
      },
      findTalent: {
        title: "Find Top Talent",
        desc: "Browse through thousands of skilled professionals ready to work on your projects.",
      },
      securePayments: {
        title: "Secure Payments",
        desc: "Safe and reliable payment system with escrow protection for both parties.",
      },
      realTimeChat: {
        title: "Real-Time Communication",
        desc: "Chat, video call, and collaborate seamlessly with your team and freelancers.",
      },
    },
    categories: {
      title: "Browse by Category",
      subtitle: "Find freelancers in your field",
      freelancers: "Freelancers",
      popularCategories: "Popular Freelance Categories",
      development: "Development",
      design: "Design",
      marketing: "Marketing",
      mobile: "Mobile",
      writing: "Writing",
      translation: "Translation",
      business: "Business",
      consulting: "Consulting",
      adminSupport: "Admin Support",
      eliteFreelancers: "Elite Freelancers",
    },
    testimonials: {
      title: "What Our Users Say",
      subtitle: "Join thousands of successful freelancers and businesses on HustleX",
      list: [
        {
          quote: "HustleX helped me find high-paying clients in just a week! The platform is intuitive and secure.",
          name: "Abebe Kebede",
          role: "Freelancer",
        },
        {
          quote: "Posting jobs and connecting with talented freelancers has never been easier. Highly recommend!",
          name: "Selam Tesfaye",
          role: "Client",
        },
      ],
    },
    featuredFreelancers: {
      title: "Elite Freelancers",
      yohannes: { name: "Yohannes", title: "Full Stack Developer", rate: "$28/hr" },
      samuel: { name: "Samuel T.", title: "Full Stack Developer", rate: "$25/hr" },
      messi: { name: "Messi", title: "Mobile Developer", rate: "$30/hr" },
      lily: { name: "Lily M.", title: "UI/UX Designer", rate: "$30/hr" },
    },
    cta: {
      title: "Join Our Growing Community",
      subtitle: "Whether you're a freelancer looking for opportunities or a business seeking talent, HustleX is your gateway to success in the digital economy.",
      subtitleHighlight: "Start your journey to success!",
      getStarted: "Get Started Today",
      learnMore: "Community",
      findDreamWork: "Find Dream Work",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Watch this stunning video to see how HustleX transforms your freelance journey in just 60 seconds!",
      videoSubtitle: "HustleX",
      steps: {
        signUp: { title: "Browse Jobs", desc: "Explore a wide variety of freelance jobs posted by employers. Use filters to find exactly what matches your skills." },
        browse: { title: "Apply or Post", desc: "Freelancers can apply to jobs that fit their expertise, and clients can post new jobs with all the necessary details." },
        connect: { title: "Connect & Work", desc: "Communicate securely through our platform, complete the tasks, and deliver quality work." },
        succeed: { title: "Get Paid", desc: "Once the work is completed and approved, you can arrange payments directly with your client." },
      },
    },
    companies: {
      trustedBy: "Trusted by Top",
      companies: "Companies",
    },
    footer: {
      description: "HustleX - Connecting talent with opportunity across Ethiopia and beyond.",
      quickLinks: "Quick Links",
      resources: "Resources",
      followUs: "Follow Us",
      allRightsReserved: "All rights reserved.",
      forClients: "For Clients",
      forFreelancers: "For Freelancers",
      company: "Company",
      howToHire: "How to Hire",
      talentMarketplace: "Talent Marketplace",
      howToFindWork: "How to Find Work",
      freelanceJobs: "Freelance Jobs",
      aboutUs: "About Us",
      careers: "Careers",
      contactUs: "Contact Us",
      helpCenter: "Help Center",
      blog: "Blog",
      community: "Community",
      api: "API Documentation",
      madeWith: "Made with",
      inEthiopia: "in Ethiopia",
    },
    common: {
      language: "Language",
      darkMode: "Dark Mode",
      loading: "Loading...",
      error: "Error",
      success: "Success",
    },
    payment: {
      backToPricing: "Back to Pricing",
      completePayment: "Complete Your Payment",
      choosePaymentMethod: "Choose your preferred payment method to subscribe",
      payWithTelebirr: "Pay with Telebirr mobile money",
      phoneNumber: "Phone Number",
      enterPhoneNumber: "Enter your Phone number",
      enterPhoneNumberPlaceholder: "Enter your Phone number",
      continue: "Continue",
      paymentRequestSent: "Payment Request Sent",
      paymentRequestSentTo: "A payment request has been sent to",
      checkPhoneAndEnterPin: "Please check your phone and enter your PIN to confirm the payment.",
      waitingForConfirmation: "Waiting for payment confirmation...",
      paymentSuccessful: "Payment Successful!",
      subscriptionActivated: "Your subscription has been activated.",
      redirectingToDashboard: "Redirecting to dashboard...",
      planSummary: "Plan Summary",
      mobileMoneyPayment: "Mobile money payment",
      back: "Back",
      stepPhoneNumber: "Phone Number",
      stepPaymentProcess: "Payment in Process",
      stepConfirmation: "Confirmation",
    },
    stats: {
      happyClients: "Happy Clients",
      successProjects: "Success Projects",
      projectsCompleted: "Projects Completed",
      successRate: "Success Rate",
    },
    pricing: {
      chooseYourPlan: "Choose Your",
      plan: "Plan",
      selectPerfectPlan: "Select the perfect plan for your business needs. Start free or upgrade anytime.",
      startFreeOrUpgrade: "Start free or upgrade anytime.",
      freeTrial: "Free Trial",
      basicPlan: "Basic Plan",
      premiumPlan: "Premium Plan",
      forever: "forever",
      perMonth: "per month",
      perfectForGettingStarted: "Perfect for getting started",
      forGrowingBusinesses: "For growing businesses",
      forEnterpriseNeeds: "For enterprise needs",
      mostPopular: "MOST POPULAR",
      getStarted: "Get Started",
      choosePlan: "Choose Plan",
      postUpTo3JobsLifetime: "Post up to 3 jobs (lifetime limit)",
      multiPlatformPosting: "Multi-platform posting",
      browseFreelancerProfiles: "Browse freelancer profiles",
      basicMessaging: "Basic messaging",
      standardSupport: "Standard support",
      accessToJobListings: "Access to job listings",
      postUpTo10JobsPerMonth: "Post up to 10 jobs per month",
      unlimitedFreelancerBrowsing: "Unlimited freelancer browsing",
      priorityMessaging: "Priority messaging",
      prioritySupport: "Priority support",
      advancedSearchFilters: "Advanced search filters",
      jobAnalyticsDashboard: "Job analytics dashboard",
      featuredJobListings: "Featured job listings",
      unlimitedJobPosts: "Unlimited job posts",
      unlimitedFreelancerAccess: "Unlimited freelancer access",
      premiumMessagingVideoCalls: "Premium messaging & video calls",
      dedicatedSupport: "24/7 dedicated support",
      advancedAnalyticsInsights: "Advanced analytics & insights",
      featuredPromotedListings: "Featured & promoted listings",
      customBrandingOptions: "Custom branding options",
      apiAccess: "API access",
      dedicatedAccountManager: "Dedicated account manager",
      earlyAccessToNewFeatures: "Early access to new features",
      frequentlyAskedQuestions: "Frequently Asked Questions",
      canIChangePlansLater: "Can I change plans later?",
      canIChangePlansLaterAnswer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
      whatPaymentMethodsDoYouAccept: "What payment methods do you accept?",
      whatPaymentMethodsDoYouAcceptAnswer: "We accept all major credit cards, debit cards, and mobile money services in Ethiopia.",
      isThereAContract: "Is there a contract?",
      isThereAContractAnswer: "No contracts! You can cancel your subscription at any time with no penalties.",
      doYouOfferRefunds: "Do you offer refunds?",
      doYouOfferRefundsAnswer: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
    },
    contactUs: {
      getInTouch: "Get In Touch",
      getInTouchWith: "Get In Touch With",
      haveQuestions: "Have questions about our platform? Need support with your account? We're here to help you succeed in the world of freelance work.",
      phone: "Phone",
      email: "Email",
      office: "Office",
      businessHours: "Business Hours",
      monFriHours: "Mon-Fri 9AM-6PM EAT",
      respondWithin24Hours: "We'll respond within 24 hours",
      weekendSupportAvailable: "Weekend support available",
      sendUsMessage: "Send us a Message",
      fullName: "Full Name",
      emailAddress: "Email Address",
      subject: "Subject",
      message: "Message",
      selectSubject: "Select a subject",
      generalInquiry: "General Inquiry",
      technicalSupport: "Technical Support",
      partnership: "Partnership",
      billingPayments: "Billing & Payments",
      feedback: "Feedback",
      other: "Other",
      yourFullName: "Your full name",
      yourEmailPlaceholder: "your.email@example.com",
      tellUsHowWeCanHelp: "Tell us how we can help you...",
      sending: "Sending...",
      sendMessage: "Send Message",
      visitOurOffice: "Visit Our Office",
      hustleXHQ: "HustleX HQ",
      officeLocationDescription: "Located in the heart of Addis Ababa's business district, our office serves as the central hub for innovation and collaboration in Ethiopia's growing freelance ecosystem.",
      openInGoogleMaps: "Open in Google Maps",
      followUs: "Follow Us",
      needQuickAnswers: "Need Quick Answers?",
      checkOutFAQ: "Check out our comprehensive FAQ section for instant answers to common questions.",
      visitFAQ: "Visit FAQ",
      validationFailed: "Validation failed:",
      failedToSendMessage: "Failed to send message. Please try again.",
      failedToSendMessageCheckConnection: "Failed to send message. Please check your connection and try again.",
    },
    faq: {
      whatIsHustleX: "What is HustleX?",
      whatIsHustleXAnswer: "HustleX is Ethiopia's premier freelance platform connecting talented Ethiopian freelancers with businesses worldwide. We provide a secure, reliable marketplace where clients can find skilled professionals and freelancers can showcase their expertise.",
      howDoIGetStartedAsFreelancer: "How do I get started as a freelancer?",
      howDoIGetStartedAsFreelancerAnswer: "Getting started is easy! Simply create a free account, complete your profile with your skills and experience, set up your payment information, and start browsing available projects. You can also create a compelling portfolio to showcase your work to potential clients.",
      howDoIPostJobAsClient: "How do I post a job as a client?",
      howDoIPostJobAsClientAnswer: "As a client, you can post jobs by creating an account, navigating to the 'Post Job' section, and providing detailed information about your project including requirements, budget, timeline, and skills needed. Our platform will match you with qualified freelancers.",
      whatAreTheFees: "What are the fees for using the platform?",
      whatAreTheFeesAnswer: "For freelancers, we don't charge service fee. Clients can post jobs for free, We also offer premium memberships with additional benefits and lower fees. (coming soon)",
      whatCategoriesAvailable: "What categories of work are available?",
      whatCategoriesAvailableAnswer: "We support over 200 different skills across major categories including Development, Design, Marketing, Writing, Mobile Development, Business Consulting, Translation, and many more specialized services.",
      howDoICommunicate: "How do I communicate with my freelancer/client?",
      howDoICommunicateAnswer: "Our platform provides built-in messaging tools for secure communication.The freelancer and client can interact throgh this messaging tools or directly through the email.",
      whatIfNotSatisfied: "What if I'm not satisfied with the work?",
      whatIfNotSatisfiedAnswer: "We have a dispute resolution process to handle any issues. If you're not satisfied, you can request revisions or file a dispute. Our support team will mediate and work towards a fair resolution for both parties.",
      canIWorkInternationally: "Can I work with international clients/freelancers?",
      canIWorkInternationallyAnswer: "Absolutely! HustleX connects Ethiopian talent with clients worldwide.",
      isCustomerSupportAvailable: "Is there customer support available?",
      isCustomerSupportAvailableAnswer: "Yes! We provide 24/7 customer support through our help center, live chat, and email. Our support team is knowledgeable about both freelancer and client needs and can help resolve any issues quickly.",
      gotQuestions: "Got Questions? We've Got Answers!",
      gotAnswers: "Find answers to the most common questions about using HustleX. Can't find what you're looking for? Contact our support team.",
      contactSupportDesc: "Our support team is here to help you succeed on HustleX.",
      stillHaveQuestions: "Still Have Questions?",
      howRatePlatform: "How would you rate your platform?",
      howRatePlatformAnswer: "We take pride in our service. Our users consistently rate us as the top freelance destination in Ethiopia.",
      contactSupport: "Contact Support",
      visitHelpCenter: "Visit Help Center",
    },
    helpCenter: {
      title: "Help Center",
      subtitle: "Find answers fast, explore guides, watch tutorials, and get the most out of HustleX.",
      searchPlaceholder: "Search for help articles...",
      gettingStarted: "Getting Started",
      gettingStartedDesc: "Create account, set up profile, and basics.",
      usingHustleX: "Using HustleX",
      usingHustleXDesc: "Jobs, proposals, messaging, and hiring.",
      billingPayments: "Billing & Payments",
      billingPaymentsDesc: "Invoices, payouts, and disputes.",
      securitySafety: "Security & Safety",
      securitySafetyDesc: "Account protection and best practices.",
      freelancerSuccess: "Freelancer Success",
      freelancerSuccessDesc: "Tips to stand out and win work.",
      forClients: "For Clients",
      forClientsDesc: "Hiring, managing projects, and payments.",
      popularArticles: "Popular Articles",
      allCategories: "All Categories",
      views: "views",
      helpful: "helpful",
      readMore: "Read More",
      backToHelpCenter: "Back to Help Center",
      noResultsFound: "No results found",
      tryDifferentSearch: "Try a different search term",
    },
    aboutUs: {
      activeFreelancers: "Active Freelancers",
      ourStory: "Our Story",
      ourStoryDescription: "Founded in 2023, HustleX was born from a simple idea: Ethiopia’s talented professionals deserve better access to global opportunities. Experiencing the challenges of the traditional job market firsthand, our founder set out to create a platform that would make freelance work accessible, fair, and rewarding. Though we are just getting started, HustleX is already building a community that connects skilled professionals with clients worldwide. Our mission goes beyond a marketplace—we’re creating a movement that empowers Ethiopia’s digital workforce to thrive in the global economy.",
      ourMission: "Our Mission",
      ourMissionDescription: "To empower Ethiopian freelancers and businesses by providing a secure, innovative platform that connects talent with opportunity, fostering economic growth and professional development.",
      ourValues: "Our Values",
      innovation: "Innovation",
      innovationDesc: "We continuously innovate to provide cutting-edge solutions for the freelance community.",
      community: "Community",
      communityDesc: "Building a supportive community where talent meets opportunity in Ethiopia and beyond.",
      excellence: "Excellence",
      excellenceDesc: "Committed to delivering exceptional quality and fostering professional growth.",
      globalReach: "Global Reach",
      globalReachDesc: "Connecting Ethiopian talent with opportunities worldwide through our platform.",
      meetOurTeam: "Meet Our Team",
      meetOurFounder: "Meet Our Founder",
      visionarySubtitle: "The visionary behind HustleX, dedicated to empowering Ethiopia's digital workforce",
      founder: "Founder",
      founderName: "Yohannes Fikre",
      founderBio: "Driven by a passion for connecting talent with opportunity, I created HustleX to empower freelancers and clients across Ethiopia and beyond. My goal is simple: make finding work and discovering talent seamless, fair, and inspiring. At HustleX, every connection is a step toward growth, creativity, and success.",
      founderCEO: "Founder & CEO",
      frontendDeveloper: "Front-end Developer",
      fullstackDeveloper: "Full-stack Developer",
      visionaryLeaderBio: "Visionary leader with 5+ years in tech entrepreneurship, passionate about empowering Ethiopian talent.",
      frontendDeveloperBio: "Frontend developer skilled in React, JavaScript, HTML, and CSS, creating clean, responsive, and user-friendly web applications.",
      fullstackDeveloperBio: "Full-stack developer building robust, scalable solutions for our growing community.",
    },
    signup: {
      createAccount: "Create Account",
      welcomeBack: "Welcome Back",
      loginToContinue: "Sign in to continue",
      joinHustleX: "Join HustleX and start your freelance journey",
      freelancer: "Freelancer",
      client: "Client",
      signUp: "Sign Up",
      signUpWithGoogle: "Sign up with Google",
      signUpWithApple: "Sign up with Apple",
      comingSoon: "(Coming Soon)",
      useYourEmail: "Use your email",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      iWantTo: "I want to:",
      findWork: "Find Work",
      hireFreelancers: "Hire Freelancers",
      creatingAccount: "Creating Account...",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Enter your email",
      forgotPassword: "Forgot password?",
      signingIn: "Logging in...",
      accountFound: "Account Found",
      accountExistsMessage: "An account with this email already exists. You can:",
      continueWithExistingRole: "Continue with existing role:",
      account: "Account",
      orAddNewRole: "Or add a new role to your account:",
      addFreelancerRole: "Add Freelancer Role",
      offerServices: "Offer your services and find work",
      add: "Add",
      addClientRole: "Add Client Role",
      hireFreelancersAndPost: "Hire freelancers and post jobs",
      backToAccountSelection: "Back to account selection",
      signInToAddRole: "Sign in to add {role} role to your account",
      signInToContinue: "Sign in to continue as {role}",
      pleaseEnterPassword: "Please enter your password",
      passwordsDoNotMatch: "Passwords do not match",
      passwordRequirements: "Password must be at least 8 characters long and contain at least one letter and one number",
      accountAlreadyExists: "An account with this email already exists. Please choose from existing accounts above.",
      failedToCreateAccount: "Failed to create account. Please try again.",
      tooManyRequests: "Too many requests. Please wait a moment and try again.",
      invalidEmailOrPassword: "Invalid email or password. Please try again.",
      googleSignupFailed: "Google sign-up failed: {error}",
      googleSignupComingSoon: "Google signup will be implemented soon. Please use email/password.",
    },
    login: {
      login: "Login",
      signInWithGoogle: "Sign in with Google",
      signInWithApple: "Sign in with Apple",
      comingSoon: "(Coming Soon)",
      useYourEmail: "Use your email",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      signingIn: "Signing in...",
      signIn: "Sign In",
      dontHaveAccount: "Don't have an account?",
      signUp: "Register here",
      incorrectEmailOrPassword: "Incorrect email or password. Please try again.",
      googleLoginFailed: "Failed to sign in with Google",
      googleLoginComingSoon: "Google login will be implemented soon. Please use email/password.",
      failedToAddRole: "Failed to add role. Please try again.",
    },
    postJob: {
      postAJob: "Post a Job",
      createJobListing: "Create Your Job Listing",
      checkingAuthentication: "Checking authentication...",
      jobTitle: "Job Title *",
      enterJobTitle: "Enter job title",
      companyName: "Company Name *",
      enterCompanyName: "Enter company name",
      category: "Category *",
      selectCategory: "Select a category",
      jobType: "Job Type *",
      selectJobType: "Select job type",
      experienceLevel: "Experience Level *",
      selectExperience: "Select experience level",
      salaryRange: "Salary Range *",
      enterSalaryRange: "Enter salary range (e.g., 50,000-70,000 ETB)",
      description: "Description *",
      enterDescription: "Enter job description",
      deadline: "Deadline *",
      selectDeadline: "Select deadline",
      workLocation: "Work Location *",
      selectWorkLocation: "Select work location",
      skills: "Required Skills",
      selectSkills: "Select required skills",
      gender: "Gender Preference",
      selectGender: "Select gender preference",
      vacancies: "Number of Vacancies",
      enterVacancies: "Enter number of vacancies",
      address: "Address",
      enterAddress: "Enter address",
      country: "Country *",
      selectCountry: "Select country",
      city: "City",
      enterCity: "Enter city",
      jobLink: "Job Link (Optional)",
      enterJobLink: "Enter job link (if applicable)",
      visibility: "Visibility",
      public: "Public",
      private: "Private",
      postJob: "Post Job",
      posting: "Posting...",
      errorPostingJob: "Error posting job.",
      lifetimeLimitReached: "This is a lifetime limit. You must upgrade to a paid plan to post any more jobs.",
      upgradeToPostMore: "Please upgrade your plan to continue posting jobs.",
      upgradePlan: "Upgrade Plan",
      required: "Required",
    },
  },
  am: {
    nav: {
      home: "መነሻ",
      aboutUs: "ስለእኛ",
      exploreJobs: "ስራዎችን ያስሱ",
      pricing: "ዋጋ",
      blog: "ብሎግ",
      faq: "ጥያቄዎች",
      howItWorks: "እንዴት ይሠራል",
      contact: "ያግኙን",
      findFreelancers: "ነጻ ሰራተኞችን ያግኙ",
      logIn: "ግባ",
      signUp: "ተመዝግብ",
    },
    hero: {
      title: "በብልሃት ስራ",
      titleHighlight: "በፍጥነት ተግብር",
      subtitle: "ንግዶችን ከከፍተኛ የኢትዮጵያ ችሎታዎች ጋር ማገናኘት",
      subtitleHighlight: "በ200+ ክህሎቶች ውስጥ።",
      getStarted: "ጀምር",
      findTalent: "ችሎታ ያግኙ",
      joinAsFreelancer: "እንደ ነጻ ሰራተኛ ይቀላቀሉ",
    },
    features: {
      title: "ለምን HustleX?",
      subtitle: "በነጻ ስራ ገበያ ውስጥ ለማሳካት የሚያስፈልጉዎ ሁሉ",
      postJobs: {
        title: "ስራዎችን በቀላሉ ይለጥፉ",
        desc: "ስራዎችን በደቂቃዎች ውስጥ ይፍጠሩ እና ይለጥፉ። ለፕሮጀክትዎ ተስማሚውን ነጻ ሰራተኛ ያግኙ።",
      },
      findTalent: {
        title: "ከፍተኛ ችሎታዎችን ያግኙ",
        desc: "በሺዎች የሚቆጠሩ የተሰለጡ ባለሙያዎችን ያስሱ እና በፕሮጀክቶችዎ ላይ ለመስራት ዝግጁ።",
      },
      securePayments: {
        title: "ደህንነቱ የተጠበቀ ክፍያ",
        desc: "ለሁለቱም ወገኖች ከኢስክሮው ጥበቃ ጋር ደህንነቱ የተጠበቀ እና አስተማማኝ የክፍያ ስርዓት።",
      },
      realTimeChat: {
        title: "በቀጥታ ግንኙነት",
        desc: "ከቡድንዎ እና ከነጻ ሰራተኞች ጋር በቀላሉ ያውሩ፣ ቪዲዮ ጥሪ ይጠቀሙ እና ይተባበሩ።",
      },
    },
    categories: {
      title: "በምድብ ያስሱ",
      subtitle: "በሜዳዎ ውስጥ ነጻ ሰራተኞችን ያግኙ",
      freelancers: "ነጻ ሰራተኞች",
      popularCategories: "የታዋቂ ነጻ ስራ ምድቦች",
      development: "ልማት",
      design: "ዲዛይን",
      marketing: "ግብይት",
      mobile: "ሞባይል",
      writing: "ጽሁፍ",
      translation: "ትርጉም",
      business: "ንግድ",
      consulting: "ምክክር",
      adminSupport: "የአስተዳደር ድጋፍ",
      eliteFreelancers: "ከፍተኛ ነጻ ሰራተኞች",
    },
    testimonials: {
      title: "ተጠቃሚዎቻችን ምን ይላሉ",
      subtitle: "በHustleX ላይ በሺዎች የሚቆጠሩ የተሳኩ ነጻ ሰራተኞች እና ንግዶች ይቀላቀሉ",
      list: [
        {
          quote: "HustleX በአንድ ሳምንት ውስጥ ብቻ ከፍተኛ ክፍያ የሚከፍሉ ደንበኞችን እንዳገኝ ረድቶኛል! መድረኩ ለመጠቀም ቀላል እና አስተማማኝ ነው።",
          name: "አበበ ከበደ",
          role: "ነጻ ሰራተኛ",
        },
        {
          quote: "ስራ መለጠፍ እና ከጎበዝ ነጻ ሰራተኞች ጋር መገናኘት ከዚህ በፊት እንዲህ ቀሎ አያውቅም። በጣም እመክራለሁ!",
          name: "ሰላም ተስፋዬ",
          role: "ደንበኛ",
        },
      ],
    },
    featuredFreelancers: {
      title: "ከፍተኛ ነጻ ሰራተኞች",
      yohannes: { name: "ዮሐንስ", title: "ሙሉ አቅርቦት አዳዲስ", rate: "፳፰ ዶላር/ሰዓት" },
      samuel: { name: "ሳሙኤል ተ.", title: "ሙሉ አቅርቦት አዳዲስ", rate: "፳፭ ዶላር/ሰዓት" },
      messi: { name: "ሜሲ", title: "የሞባይል አዳዲስ", rate: "፴ ዶላር/ሰዓት" },
      lily: { name: "ሊሊ መ.", title: "UI/UX ዲዛይነር", rate: "፴ ዶላር/ሰዓት" },
    },
    cta: {
      title: "ለመጀመር ዝግጁ ነዎት?",
      subtitle: "የኢትዮጵያን ትልቁን የችሎታ ነጻ ሰራተኞች እና ንግዶች ማህበረሰብ ይቀላቀሉ",
      subtitleHighlight: "ወደ ስኬት ጉዞዎን ይጀምሩ!",
      getStarted: "ዛሬ ይጀምሩ",
      learnMore: "ተጨማሪ ይወቁ",
      findDreamWork: "የምትመኙትን ስራ ያግኙ",
    },
    howItWorks: {
      title: "እንዴት እንደሚሰራ",
      subtitle: "HustleX በ60 ሰከንድ ውስጥ የነፃ ስራ ጉዞዎን እንዴት እንደሚለውጥ ለማየት ይህንን አስደናቂ ቪዲዮ ይመልከቱ!",
      videoSubtitle: "HustleX",
      steps: {
        signUp: { title: "ስራዎችን ያስሱ", desc: "በቀጣሪዎች የሚለጠፉ የተለያዩ የነጻ ስራዎችን ያስሱ። ከችሎታዎ ጋር በትክክል የሚዛመደውን ለማግኘት ማጣሪያዎችን ይጠቀሙ።" },
        browse: { title: "ያመልክቱ ወይም ይለጥፉ", desc: "ነጻ ሰራተኞች ከችሎታቸው ጋር ለሚዛመዱ ስራዎች ማመልከት ይችላሉ፣ እና ደንበኞች አዳዲስ ስራዎችን ከሁሉም አስፈላጊ ዝርዝሮች ጋር መለጠፍ ይችላሉ።" },
        connect: { title: "ይገናኙ እና ይስሩ", desc: "በመድረካችን ደህንነቱ በተጠበቀ ሁኔታ ይገናኙ፣ ተግባራቶቹን ያጠናቅቁ እና ጥራት ያለው ስራ ያቅርቡ።" },
        succeed: { title: "ክፍያ ያግኙ", desc: "ስራው ተጠናቆ ሲጸድቅ ክፍያዎችን በቀጥታ ከደንበኛዎ ጋር ማመቻቸት ይችላሉ።" },
      },
    },
    companies: {
      trustedBy: "ከከፍተኛ",
      companies: "ኩባንያዎች የታመነ",
    },
    footer: {
      description: "HustleX - በኢትዮጵያ እና በላይ እድልን ከችሎታ ጋር ማገናኘት።",
      quickLinks: "ፈጣን አገናኞች",
      resources: "መርጃዎች",
      followUs: "እኛን ይከተሉን",
      allRightsReserved: "ሁሉም መብቶች የተጠበቁ ናቸው።",
      forClients: "ለደንበኞች",
      forFreelancers: "ለነጻ ሰራተኞች",
      company: "ኩባንያ",
      howToHire: "እንዴት እንደሚቀጠሩ",
      talentMarketplace: "የችሎታ ገበያ",
      howToFindWork: "ስራ እንዴት እንደሚገኝ",
      freelanceJobs: "ነጻ ስራዎች",
      aboutUs: "ስለእኛ",
      careers: "ስራዎች",
      contactUs: "ያግኙን",
      helpCenter: "የእርዳታ ማዕከል",
      blog: "ብሎግ",
      community: "ማህበረሰብ",
      api: "API ሰነድ",
      madeWith: "በ",
      inEthiopia: "ኢትዮጵያ ውስጥ ተሰራ",
    },
    common: {
      language: "ቋንቋ",
      darkMode: "ጨለማ ሁነታ",
      loading: "በመጫን ላይ...",
      error: "ስህተት",
      success: "ተሳክቷል",
    },
    payment: {
      backToPricing: "ወደ ዋጋ ማዘጋጃ ተመለስ",
      completePayment: "ክፍያዎን ያጠናቅቁ",
      choosePaymentMethod: "ለመመዝገብ የሚመርጡትን የክፍያ ዘዴ ይምረጡ",
      payWithTelebirr: "በቴሌብር ሞባይል ገንዘብ ይክፈሉ",
      phoneNumber: "የስልክ ቁጥር",
      enterPhoneNumber: "የስልክ ቁጥርዎን ያስገቡ",
      enterPhoneNumberPlaceholder: "የስልክ ቁጥርዎን ያስገቡ",
      continue: "ቀጥል",
      paymentRequestSent: "የክፍያ ጥያቄ ተልኳል",
      paymentRequestSentTo: "የክፍያ ጥያቄ ወደ",
      checkPhoneAndEnterPin: "እባክዎ ስልክዎን ይመልከቱ እና ክፍያውን ለማረጋገጥ PIN ያስገቡ።",
      waitingForConfirmation: "የክፍያ ማረጋገጫ በመጠባበቅ ላይ...",
      paymentSuccessful: "ክፍያ በተሳካ ሁኔታ!",
      subscriptionActivated: "የደንበኝነት ምዝገባዎ ተግባራዊ ተደርጎታል።",
      redirectingToDashboard: "ወደ ዳሽቦርድ በመመለስ ላይ...",
      planSummary: "የዕቅድ ማጠቃለያ",
      mobileMoneyPayment: "የሞባይል ገንዘብ ክፍያ",
      back: "ተመለስ",
      stepPhoneNumber: "የስልክ ቁጥር",
      stepPaymentProcess: "ክፍያ በሂደት ላይ",
      stepConfirmation: "ማረጋገጫ",
    },
    stats: {
      happyClients: "ደስ የሚሉ ደንበኞች",
      successProjects: "የተሳኩ ፕሮጀክቶች",
      projectsCompleted: "የተጠናቀቁ ፕሮጀክቶች",
      successRate: "የስኬት መጠን",
    },
    pricing: {
      chooseYourPlan: "ዕቅድዎን",
      plan: "ምረጡ",
      selectPerfectPlan: "ለንግድ ድርጅትዎ ተስማሚ ዕቅድ ይምረጡ። በነጻ ይጀምሩ ወይም በማንኛውም ጊዜ ያሻሽሉ።",
      startFreeOrUpgrade: "በነጻ ይጀምሩ ወይም በማንኛውም ጊዜ ያሻሽሉ።",
      freeTrial: "ነጻ ሙከራ",
      basicPlan: "መሰረታዊ ዕቅድ",
      premiumPlan: "ፕሪሚየም ዕቅድ",
      forever: "ለዘላለም",
      perMonth: "በወር",
      perfectForGettingStarted: "ለመጀመር ተስማሚ",
      forGrowingBusinesses: "ለሚያድጉ ንግዶች",
      forEnterpriseNeeds: "ለድርጅታዊ ፍላጎቶች",
      mostPopular: "በጣም ታዋቂ",
      getStarted: "ጀምር",
      choosePlan: "ዕቅድ ምረጥ",
      postUpTo3JobsLifetime: "እስከ 3 ስራዎች ለጥቂት ጊዜ ይለጥፉ",
      multiPlatformPosting: "በበርካታ መድረኮች ላይ ማስቀመጥ",
      browseFreelancerProfiles: "የነጻ ሰራተኞች መገለጫዎችን ይፈልጉ",
      basicMessaging: "መሰረታዊ መልዕክት",
      standardSupport: "መደበኛ ድጋፍ",
      accessToJobListings: "ወደ ስራ ዝርዝሮች መዳረሻ",
      postUpTo10JobsPerMonth: "በወር እስከ 10 ስራዎች ይለጥፉ",
      unlimitedFreelancerBrowsing: "ያልተገደበ የነጻ ሰራተኞች መፈለግ",
      priorityMessaging: "የቅድሚያ መልዕክት",
      prioritySupport: "የቅድሚያ ድጋፍ",
      advancedSearchFilters: "የላቀ የፍለጋ ማጣሪያዎች",
      jobAnalyticsDashboard: "የስራ ትንተና ዳሽቦርድ",
      featuredJobListings: "የተለዩ የስራ ዝርዝሮች",
      unlimitedJobPosts: "ያልተገደበ የስራ ልጥፎች",
      unlimitedFreelancerAccess: "ያልተገደበ የነጻ ሰራተኞች መዳረሻ",
      premiumMessagingVideoCalls: "ፕሪሚየም መልዕክት እና ቪዲዮ ጥሪዎች",
      dedicatedSupport: "24/7 የተመደበ ድጋፍ",
      advancedAnalyticsInsights: "የላቀ ትንተና እና ግንዛቤዎች",
      featuredPromotedListings: "የተለዩ እና የተደገፉ ዝርዝሮች",
      customBrandingOptions: "ብጁ የምልክት አማራጮች",
      apiAccess: "API መዳረሻ",
      dedicatedAccountManager: "የተመደበ የመለያ አስተዳዳሪ",
      earlyAccessToNewFeatures: "ወደ አዳዲስ ባህሪያት የመጀመሪያ መዳረሻ",
      frequentlyAskedQuestions: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
      canIChangePlansLater: "ዕቅዶችን በኋላ ማለት እችላለሁ?",
      canIChangePlansLaterAnswer: "አዎ! ዕቅድዎን በማንኛውም ጊዜ ማሻሻል ወይም መቀነስ ይችላሉ። ለውጦቹ በሚቀጥለው የክፍያ ዑደትዎ ውስጥ ይንጸባረቃሉ።",
      whatPaymentMethodsDoYouAccept: "ምን ዓይነት የክፍያ ዘዴዎችን ትቀበላላችሁ?",
      whatPaymentMethodsDoYouAcceptAnswer: "በኢትዮጵያ ውስጥ ሁሉንም ዋና ዋና ክሬዲት ካርዶች፣ ዴቢት ካርዶች እና የሞባይል ገንዘብ አገልግሎቶችን እንቀበላለን።",
      isThereAContract: "ውል አለ?",
      isThereAContractAnswer: "ውሎች የሉም! ምዝገባዎን በማንኛውም ጊዜ ያለ ቅጣት ማቋረጥ ይችላሉ።",
      doYouOfferRefunds: "መመለሻ ትሰጣላችሁ?",
      doYouOfferRefundsAnswer: "አዎ፣ ለሁሉም የተከፈሉ ዕቅዶች 30 ቀናት የገንዘብ መመለሻ ዋስትና እንሰጣለን።",
    },
    contactUs: {
      getInTouch: "ያግኙን",
      getInTouchWith: "ያግኙን",
      haveQuestions: "ስለ መድረካችን ጥያቄዎች አሉዎት? ከመለያዎ ጋር ድጋፍ ይፈልጋሉ? በነጻ ስራ ዓለም ውስጥ ለማሳካት እዚህ አለን።",
      phone: "ስልክ",
      email: "ኢሜይል",
      office: "ቢሮ",
      businessHours: "የንግድ ሰዓታት",
      monFriHours: "ሰኞ-አርብ 9AM-6PM EAT",
      respondWithin24Hours: "በ24 ሰዓት ውስጥ እንመልሳለን",
      weekendSupportAvailable: "የሳምንት ማብቂያ ድጋፍ ይገኛል",
      sendUsMessage: "መልእክት ይላኩልን",
      fullName: "ሙሉ ስም",
      emailAddress: "የኢሜይል አድራሻ",
      subject: "ርዕስ",
      message: "መልእክት",
      selectSubject: "ርዕስ ይምረጡ",
      generalInquiry: "አጠቃላይ ጥያቄ",
      technicalSupport: "የቴክኒክ ድጋፍ",
      partnership: "አጋርነት",
      billingPayments: "ክፍያ እና ክፍያዎች",
      feedback: "ግብረመልስ",
      other: "ሌላ",
      yourFullName: "ሙሉ ስምዎ",
      yourEmailPlaceholder: "your.email@example.com",
      tellUsHowWeCanHelp: "እንዴት ልንረዳዎ እንደምንችል ይንገሩን...",
      sending: "በመላክ ላይ...",
      sendMessage: "መልእክት ላክ",
      visitOurOffice: "ቢሮችን ይጎብኙ",
      hustleXHQ: "HustleX ዋና ቢሮ",
      officeLocationDescription: "በአዲስ አበባ የንግድ ወረዳ ማዕከል ውስጥ የሚገኘው ቢራችን በኢትዮጵያ በሚያድገው የነጻ ስራ ስርዓት ውስጥ ለፈጠራ እና ለትብብር ማዕከላዊ ማዕከል እንደሚያገለግል ነው።",
      openInGoogleMaps: "በGoogle Maps ውስጥ ክፈት",
      followUs: "ይከተሉን",
      needQuickAnswers: "ፈጣን መልሶች ይፈልጋሉ?",
      checkOutFAQ: "ለተለመዱ ጥያቄዎች ፈጣን መልሶች ለማግኘት የFAQ ክፍላችንን ይመልከቱ።",
      visitFAQ: "FAQ ይጎብኙ",
      validationFailed: "ማረጋገጥ አልተሳካም:",
      failedToSendMessage: "መልእክት ማስተላለፍ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
      failedToSendMessageCheckConnection: "መልእክት ማስተላለፍ አልተሳካም። እባክዎ ግንኙነትዎን ይፈትሹ እና እንደገና ይሞክሩ።",
    },
    faq: {
      whatIsHustleX: "HustleX ምንድን ነው?",
      whatIsHustleXAnswer: "HustleX የኢትዮጵያ ዋና የነጻ ስራ መድረክ ነው፣ ታላላቅ የኢትዮጵያ ነጻ ሰራተኞችን ከዓለም አቀፍ ንግዶች ጋር ያገናኛል። ደንበኞች የበቁ ሙያዊዎችን ሊያገኙ እና ነጻ ሰራተኞች ክህሎታቸውን ሊያሳዩ የሚችሉበት ደህንነቱ የተጠበቀ እና አስተማማኝ ገበያ እናቀርባለን።",
      howDoIGetStartedAsFreelancer: "እንደ ነጻ ሰራተኛ እንዴት ማጀምር እችላለሁ?",
      howDoIGetStartedAsFreelancerAnswer: "መጀመር ቀላል ነው! በቀላሉ ነጻ መለያ ይፍጠሩ፣ መገለጫዎን በክህሎቶችዎ እና በልምድዎ ይሙሉ፣ የክፍያ መረጃዎን ያዘጋጁ፣ እና የሚገኙ ፕሮጀክቶችን ማስላት ይጀምሩ። ለምትኩ ደንበኞች ስራዎን ለማሳየት አስደሳች የስራ ማስታወሻ ሊፍጠሩ ይችላሉ።",
      howDoIPostJobAsClient: "እንደ ደንበኛ ስራ እንዴት ማስቀመጥ እችላለሁ?",
      howDoIPostJobAsClientAnswer: "እንደ ደንበኛ፣ መለያ በመፍጠር፣ 'ስራ ማስቀመጥ' ክፍል ላይ በመሄድ፣ እና ስለ ፕሮጀክትዎ ዝርዝር መረጃ ማቅረብ ስራዎችን ማስቀመጥ ይችላሉ። ይህ ዝርዝር መረጃ የሚያካትተው መስፈርቶች፣ በጀት፣ የጊዜ ሰሌዳ፣ እና የሚያስፈልጉ ክህሎቶችን ያካትታል። መድረካችን ከብቃዎች ነጻ ሰራተኞች ጋር ያዛምድዎታል።",
      whatAreTheFees: "HustleXን ለመጠቀም ምን ዓይነት ክፍያዎች አሉ?",
      whatAreTheFeesAnswer: "ለነጻ ሰራተኞች፣ አገልግሎት ክፍያ አንሰርስም። ደንበኞች ስራዎችን በነጻ ማስቀመጥ ይችላሉ። ተጨማሪ ጥቅሞች እና ዝቅተኛ ክፍያዎች ያላቸውን ፕሪሚየም አባልነት እናቀርባለን። (በቅርብ ጊዜ ይመጣል)",
      whatCategoriesAvailable: "ምን ዓይነት የስራ ምድቦች ይገኛሉ?",
      whatCategoriesAvailableAnswer: "ከ200 በላይ የተለያዩ ክህሎቶችን በዋና ዋና ምድቦች እንደሚከተሉት እንደሚከተሉት እንደርዳለን፡ ልማት፣ ዲዛይን፣ ግብይት፣ ጽሁፍ፣ ሞባይል ልማት፣ የንግድ ምክክር፣ ትርጉም፣ እና ብዙ ሌሎች ልዩ አገልግሎቶች።",
      howDoICommunicate: "ከነጻ ሰራተኛዬ/ደንበኛዬ እንዴት እገናኛለሁ?",
      howDoICommunicateAnswer: "Our platform provides built-in messaging tools for secure communication.The freelancer and client can interact throgh this messaging tools or በቀጥታ በኢሜይል ሊገናኙ ይችላሉ።",
      whatIfNotSatisfied: "ከስራው ካልደሰትሁስ?",
      whatIfNotSatisfiedAnswer: "ማንኛውንም ችግር ለመቅረጽ የክርክር መፍትሄ ሂደት አለን። ካልደሰትሁ፣ ማሻሻያዎችን ማመልከት ወይም ክርክር ማመልከት ይችላሉ። የድጋፍ ቡድናችን ይመራል እና ለሁለቱም ወገኖች ፍትሃዊ መፍትሄ ለማግኘት ይሠራል።",
      canIWorkInternationally: "ከዓለም አቀፍ ደንበኞች/ነጻ ሰራተኞች መስራት እችላለሁ?",
      canIWorkInternationallyAnswer: "በጣም! HustleX የኢትዮጵያ ችሎታን ከዓለም አቀፍ ደንበኞች ጋር ያገናኛል።",
      isCustomerSupportAvailable: "የደንበኛ ድጋፍ ይገኛል?",
      isCustomerSupportAvailableAnswer: "አዎ! በ24/7 የደንበኛ ድጋፍ እናቀርባለን በእርዳታ ማዕከላችን፣ ቀጥታ ውይይት፣ እና ኢሜይ። የድጋፍ ቡድናችን ስለ ነጻ ሰራተኞች እና ደንበኞች ፍላጎቶች የተማረ ነው እና ማንኛውንም ችግር በፍጥነት ለመፍታት ይረዳል።",
      gotQuestions: "ጥያቄዎች አሉዎት? መልሶች አሉን!",
      gotAnswers: "HustleX ን የመጠቀም በጣም የተለመዱ ጥያቄዎች መልሶችን ያግኙ። የሚፈልጉትን ማግኘት አልቻሉም? የድጋፍ ቡድናችንን ያነጋግሩ።",
      contactSupportDesc: "የእኛ ድጋፍ ቡድን በ HustleX ላይ እንዲሳካዎት ለመርዳት እዚህ አለ።",
      stillHaveQuestions: "አሁንም ጥያቄዎች አሉዎት?",
      howRatePlatform: "መድረካችንን እንዴት ይገመግሙታል?",
      howRatePlatformAnswer: "በአገልግሎታችን እንኮራለን። ተጠቃሚዎቻችን በኢትዮጵያ ቀዳሚ የነፃ ሥራ መዳረሻ አድርገው በቋሚነት ይመድቡናል።",
      contactSupport: "ድጋፍ ያግኙ",
      visitHelpCenter: "የእርዳታ ማዕከልን ይጎብኙ",
    },
    helpCenter: {
      title: "እርዳታ ማዕከል",
      subtitle: "መልሶችን በፍጥነት ያግኙ፣ መመሪያዎችን ያስሱ፣ ትምህርታዊ ቪዲዮዎችን ይመልከቱ፣ እና ከHustleX የተሻለ ውጤት ያግኙ።",
      searchPlaceholder: "ለእርዳታ ጽሑፎች ይፈልጉ...",
      gettingStarted: "መጀመሪያ",
      gettingStartedDesc: "መለያ ፍጠር፣ መገለጫ አዘጋጅ፣ እና መሰረታዊ ነገሮች።",
      usingHustleX: "HustleXን መጠቀም",
      usingHustleXDesc: "ስራዎች፣ ሐሳቦች፣ መልእክት፣ እና ማሰማራት።",
      billingPayments: "ክፍያ እና ክፍያዎች",
      billingPaymentsDesc: "ክፍያ ሰነዶች፣ ክፍያዎች፣ እና ክርክሮች።",
      securitySafety: "ደህንነት እና ደህንነት",
      securitySafetyDesc: "የመለያ ጥበቃ እና ምርጥ ልምዶች።",
      freelancerSuccess: "የነጻ ሰራተኛ ስኬት",
      freelancerSuccessDesc: "ለማብራራት እና ስራ ለማሸነፍ ምክሮች።",
      forClients: "ለደንበኞች",
      forClientsDesc: "ማሰማራት፣ ፕሮጀክቶችን ማስተዳደር፣ እና ክፍያዎች።",
      popularArticles: "ታዋቂ ጽሑፎች",
      allCategories: "ሁሉም ምድቦች",
      browseByCategory: "በምድብ ይሻሩ",
      frequentlyAskedQuestions: "ተደጋግሞ የሚጠየቁ ጥያቄዎች",
      views: "እይታዎች",
      helpful: "አጋይ",
      readMore: "ተጨማሪ ያንብቡ",
      backToHelpCenter: "ወደ እርዳታ ማዕከል ተመለስ",
      noResultsFound: "ምንም ውጤት አልተገኘም",
      tryDifferentSearch: "የተለየ የፍለጋ ቃል ይሞክሩ",
    },
    aboutUs: {
      activeFreelancers: "ንቁ ነጻ ሰራተኞች",
      ourStory: "የእኛ ታሪክ",
      ourStoryDescription: "HustleX በ2023 የተመሰረተው ከቀላል ሃሳብ ነው፡ የኢትዮጵያ ጎበዝ ባለሙያዎች የተሻለ የአለም አቀፍ እድሎች ማግኘት ይገባቸዋል። የባህላዊ የሥራ ገበያ ፈተናዎችን በገዛ እጃቸው በመለማመድ፣ መስራቻችን የነፃ ሥራን ተደራሽ፣ ፍትሃዊ እና የሚክስ የሚያደርግ መድረክ ለመፍጠር ተነሳ። ገና እየጀመርን ቢሆንም፣ HustleX ቀድሞውኑ ችሎታ ያላቸውን ባለሙያዎች በዓለም ዙሪያ ካሉ ደንበኞች ጋር የሚያገናኝ ማህበረሰብ እየገነባ ነው። የእኛ ተልእኮ ከገበያ ቦታ በላይ ነው - የኢትዮጵያ የዲጂታል የሰው ኃይል በዓለም አቀፍ ኢኮኖሚ ውስጥ እንዲበለጽግ የሚያስችል እንቅስቃሴ እየፈጠርን ነው።",
      ourMission: "የእኛ ተልዕኮ",
      ourMissionDescription: "ችሎታን ከእድል ጋር በማገናኘት፣ ኢኮኖሚያዊ እድገትን እና ሙያዊ ልማትን በማበረታታት ደህንነቱ የተጠበቀ እና የፈጠራ መድረክ በመስጠት የኢትዮጵያ ነጻ ሰራተኞችን እና ንግዶችን ማበረታታት።",
      ourValues: "የእኛ እሴቶች",
      innovation: "ፈጠራ",
      innovationDesc: "ለነጻ ስራ ማህበረሰብ የላቀ መፍትሄዎችን ለመስጠት በተከታታይ እንፈጥራለን።",
      community: "ማህበረሰብ",
      communityDesc: "ችሎታ ከእድል የሚገናኝበት የድጋፍ ማህበረሰብ በኢትዮጵያ እና በላይ መገንባት።",
      excellence: "ጥራት",
      excellenceDesc: "ለልዩ ጥራት እና ሙያዊ እድገትን ለማበረታታት ቁርጠኛ።",
      globalReach: "ዓለም አቀፍ ስፋት",
      globalReachDesc: "የኢትዮጵያ ችሎታን ከዓለም አቀፍ እድሎች ጋር በመድረካችን በመገናኘት።",
      meetOurTeam: "ቡድናችንን ይገናኙ",
      meetOurFounder: "ሊቀ መንበራችንን ይገናኙ",
      visionarySubtitle: "የኢትዮጵያ የዲጂታል የሰው ኃይልን ለማብቃት ቁርጠኛ የሆነው የHustleX ራዕይ ያለው ባለቤት",
      founder: "ሊቀ መንበር",
      founderName: "ዮሐንስ ፍቅሬ",
      founderBio: "ችሎታን ከእድል ጋር ለማገናኘት ባለው ፍላጎት ተነሳስቼ፣ በኢትዮጵያ እና ከዚያም በላይ ያሉ ፍሪላንሰሮችን እና ደንበኞችን ለማበረታታት HustleXን ፈጠርኩ። ግቤ ቀላል ነው፡ ስራ መፈለግ እና ተሰጥኦ ማግኘት እንከን የለሽ፣ ፍትሃዊ እና አነቃቂ እንዲሆን ማድረግ። በ HustleX ላይ እያንዳንዱ ግንኙነት ወደ እድገት፣ ፈጠራ እና ስኬት የሚወስድ እርምጃ ነው።",
      founderCEO: "ፈጣሪ እና ሊቀ መንበር",
      frontendDeveloper: "የፊት አካል አዳዲስ",
      fullstackDeveloper: "ሙሉ አቅርቦት አዳዲስ",
      visionaryLeaderBio: "5+ ዓመታት በቴክ ስራ ላይ የተሞላ ራዕይ ያለው መሪ፣ የኢትዮጵያ ችሎታን ማበረታታት የሚወድ።",
      frontendDeveloperBio: "በReact፣ JavaScript፣ HTML፣ እና CSS የበቁ የፊት አካል አዳዲስ፣ ንጹህ፣ ምላሽ የሚሰጥ እና ለተጠቃሚ የሚመች የድር መተግበሪያዎችን የሚፈጥር።",
      fullstackDeveloperBio: "ለሚያድገው ማህበረሰባችን ጠንካራ፣ ማስፋፊያ የሚችል መፍትሄዎችን የሚገነባ ሙሉ አቅርቦት አዳዲስ።",
    },
    signup: {
      createAccount: "መለያ ፍጠር",
      welcomeBack: "እንኳን ደህና መጡ",
      loginToContinue: "ለመቀጠል ይግቡ",
      joinHustleX: "HustleX ይቀላቀሉ እና የነጻ ስራ ጉዞዎን ይጀምሩ",
      freelancer: "ነጻ ሰራተኛ",
      client: "ደንበኛ",
      signUp: "ተመዝግብ",
      signUpWithGoogle: "በGoogle ይመዝግቡ",
      signUpWithApple: "በApple ይመዝግቡ",
      comingSoon: "(በቅርብ ጊዜ ይመጣል)",
      useYourEmail: "ኢሜይልዎን ይጠቀሙ",
      email: "ኢሜይል",
      password: "የይለፍ ቃል",
      confirmPassword: "የይለፍ ቃል ያረጋግጡ",
      firstName: "የመጀመሪያ ስም",
      lastName: "የአያት ስም",
      iWantTo: "እፈልጋለሁ:",
      findWork: "ስራ ፈልግ",
      hireFreelancers: "ነጻ ሰራተኞችን ማሰማራት",
      creatingAccount: "መለያ እየተፈጠረ ነው...",
      alreadyHaveAccount: "አስቀድመው መለያ አሎት?",
      signIn: "ኢሜይልዎን ያስገቡ",
      forgotPassword: "የይለፍ ቃልዎን ረስተዋል?",
      signingIn: "እየገባን ነው...",
      accountFound: "መለያ ተገኝቷል",
      accountExistsMessage: "በዚህ ኢሜይል የተመዘገበ መለያ አለ። ማድረግ ይችላሉ:",
      continueWithExistingRole: "ከነባሪ ሚና ይቀጥሉ:",
      account: "መለያ",
      orAddNewRole: "ወይም አዲስ ሚና ይጨምሩ:",
      addFreelancerRole: "የነጻ ሰራተኛ ሚና ይጨምሩ",
      offerServices: "አገልግሎቶችዎን ይስጡ እና ስራ ያግኙ",
      add: "ጨምር",
      addClientRole: "የደንበኛ ሚና ይጨምሩ",
      hireFreelancersAndPost: "ነጻ ሰራተኞችን ማሰማራት እና ስራዎችን ማስቀመጥ",
      backToAccountSelection: "ወደ መለያ ምርጫ ተመለስ",
      signInToAddRole: "የ{role} ሚናን ለመጨመር ይግቡ",
      signInToContinue: "እንደ {role} ለመቀጠል ይግቡ",
      pleaseEnterPassword: "እባክዎ የይለፍ ቃልዎን ያስገቡ",
      passwordsDoNotMatch: "የይለፍ ቃሎች አይጣጣሙም",
      passwordRequirements: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች ሊኖረው እና ቢያንስ አንድ ፊደል እና አንድ ቁጥር ሊይዝ ይገባል",
      accountAlreadyExists: "በዚህ ኢሜይል የተመዘገበ መለያ አለ። እባክዎ ከላይ ካሉት አካውንቶች ይምረጡ።",
      failedToCreateAccount: "መለያ መፍጠር አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
      tooManyRequests: "በጣም ብዙ ጥያቄዎች። እባክዎ ትንሽ ይጠብቁ እና እንደገና ይሞክሩ።",
      invalidEmailOrPassword: "ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል። እባክዎ እንደገና ይሞክሩ።",
      googleSignupFailed: "በGoogle መመዝገብ አልተሳካም: {error}",
      googleSignupComingSoon: "በGoogle መመዝገብ በቅርብ ጊዜ ይተገበራል። እባክዎ ኢሜይል/የይለፍ ቃል ይጠቀሙ።",
    },
    login: {
      login: "ግባ",
      signInWithGoogle: "በGoogle ይግቡ",
      signInWithApple: "በApple ይግቡ",
      comingSoon: "(በቅርብ ጊዜ ይመጣል)",
      useYourEmail: "ኢሜይልዎን ይጠቀሙ",
      email: "ኢሜይል",
      password: "የይለፍ ቃል",
      forgotPassword: "የይለፍ ቃል ረሳኽሁ?",
      signingIn: "እየገባን ነው...",
      signIn: "ግባ",
      dontHaveAccount: "መለያ የሎትም?",
      signUp: "እዚህ ይመዝገቡ",
      incorrectEmailOrPassword: "ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል። እባክዎ እንደገና ይሞክሩ።",
      googleLoginFailed: "በGoogle መግባት አልተሳካም",
      googleLoginComingSoon: "በGoogle መግባት በቅርብ ጊዜ ይተገበራል። እባክዎ ኢሜይል/የይለፍ ቃል ይጠቀሙ።",
      failedToAddRole: "ሚና ማክር አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
    },
    postJob: {
      postAJob: "ስራ ለጥፍ",
      createJobListing: "የስራ ዝርዝርዎን ይፍጠሩ",
      checkingAuthentication: "ማረጋገጥ እየተፈተነ ነው...",
      jobTitle: "የስራ ርዕስ *",
      enterJobTitle: "የስራ ርዕስ ያስገቡ",
      companyName: "የኩባንያ ስም *",
      enterCompanyName: "የኩባንያ ስም ያስገቡ",
      category: "ምድብ *",
      selectCategory: "ምድብ ይምረጡ",
      jobType: "የስራ አይነት *",
      selectJobType: "የስራ አይነት ይምረጡ",
      experienceLevel: "የልምድ ደረጃ *",
      selectExperience: "የልምድ ደረጃ ይምረጡ",
      salaryRange: "የደመወዝ ክልል *",
      enterSalaryRange: "የደመወዝ ክልል ያስገቡ (ለምሳሌ: 50,000-70,000 ETB)",
      description: "መግለጫ *",
      enterDescription: "የስራ መግለጫ ያስገቡ",
      deadline: "መጨረሻ ቀን *",
      selectDeadline: "መጨረሻ ቀን ይምረጡ",
      workLocation: "የስራ ቦታ *",
      selectWorkLocation: "የስራ ቦታ ይምረጡ",
      skills: "የሚያስፈልጉ ችሎታዎች",
      selectSkills: "የሚያስፈልጉ ችሎታዎች ይምረጡ",
      gender: "የጾታ ምርጫ",
      selectGender: "የጾታ ምርጫ ይምረጡ",
      vacancies: "የባዶ ቦታዎች ብዛት",
      enterVacancies: "የባዶ ቦታዎች ብዛት ያስገቡ",
      address: "አድራሻ",
      enterAddress: "አድራሻ ያስገቡ",
      country: "ሀገር *",
      selectCountry: "ሀገር ይምረጡ",
      city: "ከተማ",
      enterCity: "ከተማ ያስገቡ",
      jobLink: "የስራ አገናኝ (አማራጭ)",
      enterJobLink: "የስራ አገናኝ ያስገቡ (ካለ)",
      visibility: "እይታ",
      public: "የህዝብ",
      private: "የግል",
      postJob: "ስራ ለጥፍ",
      posting: "እየተለጠፈ ነው...",
      errorPostingJob: "ስራ ለመለጠፍ ስህተት።",
      lifetimeLimitReached: "ይህ የህይወት ጊዜ ገደብ ነው። ተጨማሪ ስራዎችን ለመለጠፍ የክፍያ እቅድ ማሻሻል አለብዎት።",
      upgradeToPostMore: "ስራዎችን ለመቀጠል እቅድዎን ያሻሽሉ።",
      upgradePlan: "እቅድ አሻሽል",
      required: "ያስፈልጋል",
    },
  },
  ti: {
    nav: {
      home: "መንሳፈፍ",
      aboutUs: "ብዛትና",
      exploreJobs: "ስራታት ምርምር",
      pricing: "ዋጋ",
      blog: "ብሎግ",
      faq: "ሕቶታት",
      howItWorks: "ከመዓልቲ ይሰርሕ",
      contact: "ርኸብና",
      findFreelancers: "ናጻ ሰራሕተኛታት ርኸብ",
      logIn: "እቶ",
      signUp: "ተመዝግብ",
    },
    hero: {
      title: "ብጥበብ ስርሑ",
      titleHighlight: "ብፍጥነት ተግብር",
      subtitle: "ንንግድታት ምስ ዝለዓለ ኢትዮጵያዊ ክእለት",
      subtitleHighlight: "ኣብ 200+ ክእለትታት ውሽጢ።",
      getStarted: "ጅምር",
      findTalent: "ክእለት ርኸብ",
      joinAsFreelancer: "ከነጻ ሰራተኛ እንደ ተቀላቀል",
    },
    features: {
      title: "ስለምን HustleX?",
      subtitle: "ኣብ ነጻ ስራ ዕዳጋ ንምዕዋት ዘድልየካ ዅሉ",
      postJobs: {
        title: "ስራታት ብቐሊል ኣርእይ",
        desc: "ስራታት ኣብ ደቂቃታት ውሽጢ ፍጠርን ኣሕተምን። ንፕሮጀክትካ ዝሰማማዕ ነጻ ሰራሕተኛ ርኸብ።",
      },
      findTalent: {
        title: "ዝለዓለ ክእለት ርኸብ",
        desc: "ኣብ ሺሕታት ዝቝጸር ብክእለት ዝተሰልጡ ባለሙያታት ምርምር እና ኣብ ፕሮጀክትታትካ ንምስራሕ ዝዳለዉ።",
      },
      securePayments: {
        title: "ዘረጋግጽ ክፍሊት",
        desc: "ንኽልቲ ወገናት ምስ ኢስክሮው ምክልኻል ሰናይን ኣማኒን ናይ ክፍሊት ስርዓት።",
      },
      realTimeChat: {
        title: "ብቕጽበት ርክብ",
        desc: "ምስ ጋንታኻን ነጻ ሰራሕተኛታትን ብቐሊል ተዛረብ፣ ቪድዮ ጻውዒት ተጠቐምን ተተኣሳስርን።",
      },
    },
    categories: {
      title: "ብክፍሊ ምርምር",
      subtitle: "ኣብ ዓውድኻ ነጻ ሰራሕተኛታት ርኸብ",
      freelancers: "ነጻ ሰራሕተኛታት",
      popularCategories: "ዝዓበየ ነጻ ስራ ክፍሊታት",
      development: "ልማት",
      design: "ዲዛይን",
      marketing: "ግብይት",
      mobile: "ሞባይል",
      writing: "ጽሑፍ",
      translation: "ትርጉም",
      business: "ንግድ",
      consulting: "ምክክር",
      adminSupport: "ድጋፍ አስተዳደር",
      eliteFreelancers: "ዝለዓለ ነጻ ሰራሕተኛታት",
    },
    testimonials: {
      title: "ተጠቃሚታትና እንታይ ይብሉ",
      subtitle: "ኣብ HustleX ኣብ ሺሕታት ዝቝጸር ዝዓወቱ ነጻ ሰራሕተኛታትን ንግድታትን ተቀላቀል",
      list: [
        {
          quote: "HustleX ኣብ ሓደ ሰሙን ጥራይ ዝለዓለ ክፍሊት ዝኸፍሉ ደንበኛታት ንምርካብ ሓጊዙኒ! እቲ መድረኽ ግልጽን ውሑስን እዩ።",
          name: "አበበ ከበደ",
          role: "ናጻ ሰራሕተኛ",
        },
        {
          quote: "ስራሕ ምልጣፍን ምስ ብቑዓት ናጻ ሰራሕተኛታት ምትእስሳርን ከምዚ ሕጂ ቀሊል ኮይኑ ኣይፈልጥን። ብጥኑቕ እመክር!",
          name: "ሰላም ተስፋዬ",
          role: "ደንበኛ",
        },
      ],
    },
    featuredFreelancers: {
      title: "ዝለዓለ ነጻ ሰራሕተኛታት",
      yohannes: { name: "ዮሃንስ", title: "ሙሉእ አቅርቦት አዳዲስ", rate: "$28/ሰዓት" },
      samuel: { name: "ሳሙኤል ተ.", title: "ሙሉእ አቅርቦት አዳዲስ", rate: "$25/ሰዓት" },
      messi: { name: "ሜሲ", title: "ሞባይል አዳዲስ", rate: "$30/ሰዓት" },
      lily: { name: "ሊሊ መ.", title: "UI/UX ዲዛይነር", rate: "$30/ሰዓት" },
    },
    howItWorks: {
      title: "ከመዓልቲ ይሰርሕ",
      subtitle: "HustleX ነጻ ስራ ጉዞኻ ኣብ 60 ሰከንድ ከመይ ጌርካ ከም ዝቀየሮ ንምርኣይ ነዚ ዘደንቕ ቪድዮ ርአ!",
      videoSubtitle: "HustleX",
      steps: {
        signUp: { title: "ስራሕ ብርክብ", desc: "ብቀጠርቲ ዝመሓለፉ ዝተፈላለዩ ነጻ ስራሕታት ዳህስሱ። ምስ ክእለትኩም ዝሰማማዕ ንምርካብ መጻረዪታት ተጠቐሙ።" },
        browse: { title: "ኣመልክት ወይ ለጥፍ", desc: "ነጻ ሰራሕተኛታት ምስ ሞያኦም ዝሰማማዕ ስራሕ ክሓቱ ይኽእሉ፣ ደንበኛታት ድማ ሓደስቲ ስራሕታት ምስ ኩሉ ኣድላዪ ዝርዝራት ክልጥፉ ይኽእሉ።" },
        connect: { title: "ተራኸቡን ስርሑን", desc: "ብመድረኽና ብውሑስ መገዲ ተራኸቡ፣ ዕማማትኩም ፈጽሙ፣ ብሉጽ ስራሕ ድማ ኣቕርቡ።" },
        succeed: { title: "ክፍሊት ተቐበል", desc: "እቲ ስራሕ ምስ ተዛዘመን ምስ ጸደቐን፣ ክፍሊትኩም ብቐጥታ ምስ ደንበኛኹም ክተመቻችኡ ትኽእሉ ኢኹም።" },
      },
    },
    companies: {
      trustedBy: "ንዝለዓለ",
      companies: "ኩባንያታት ተኣማንዩ",
    },
    cta: {
      title: "ንመጀመሪያ ዝዳለኻ ዲኻ?",
      subtitle: "ንዝዓበየ ኢትዮጵያዊ ማሕበረሰብ ክእለት ነጻ ሰራሕተኛታትን ንግድታትን ተቀላቀል",
      subtitleHighlight: "ንዕወት ጉዕዞኻ ጀምር!",
      getStarted: "ሎሚ ጀምር",
      learnMore: "ዝያዳ ምሕባር",
      findDreamWork: "ዕላማ ስራ ርኸብ",
    },
    footer: {
      api: "ኤፒአይ",
      description: "HustleX - ክእለት ምስ ኣጋጣሚ ኣብ ኢትዮጵያን ካብኡ ንላዕሊ ምራኸብ።",
      quickLinks: "ቀልጢፍ ኣገናኝ",
      resources: "ምንጪ",
      followUs: "ተኸተልና",
      allRightsReserved: "ኩሉ መሰላት ዝተሓልዩ እዮም።",
      forClients: "ንደንበኛታት",
      forFreelancers: "ንነጻ ሰራሕተኛታት",
      company: "ኩባንያ",
      howToHire: "ከመይ ጌርካ ከቀጥር",
      talentMarketplace: "ክእለት ዕዳጋ",
      howToFindWork: "ከመይ ጌርካ ስራ ርኸብ",
      freelanceJobs: "ነጻ ስራታት",
      aboutUs: "ብዛትና",
      careers: "ስራታት",
      contactUs: "ርኸብና",
      helpCenter: "ማዕከል ሓገዝ",
      blog: "ብሎግ",
      community: "ማሕበረሰብ",
      madeWith: "ብ",
      inEthiopia: "ኢትዮጵያ ውስጥ ተሰርሐ",
    },
    common: {
      language: "ቋንቋ",
      darkMode: "ጸሊም ሞድ",
      loading: "እትጭን...",
      error: "ጌጋ",
      success: "ተሳኪዑ",
    },
    payment: {
      backToPricing: "ናብ ዋጋ ምምላስ",
      completePayment: "ክፍሊትካ ዛዕም",
      choosePaymentMethod: "ንምቝጻር ዝተመርጽካ ናይ ክፍሊት መዳይ ምረጽ",
      payWithTelebirr: "ብቴሌብር ሞባይል ገንዘብ ክፍሊት",
      phoneNumber: "ቁጽሪ ስልኪ",
      enterPhoneNumber: "ቁጽሪ ስልኪኻ ኣእቱ",
      enterPhoneNumberPlaceholder: "ቁጽሪ ስልኪኻ ኣእቱ",
      continue: "ቀጻሊ",
      paymentRequestSent: "ናይ ክፍሊት ሕቶ ተልእኩ",
      paymentRequestSentTo: "ናይ ክፍሊት ሕቶ ናብ",
      checkPhoneAndEnterPin: "በጃኻ ስልኪኻ ርአን ነቲ ክፍሊት ንምርግጋጽ PIN ኣእቱ።",
      waitingForConfirmation: "ንምርግጋጽ ክፍሊት ተጠባበቕ...",
      paymentSuccessful: "ክፍሊት ተሳኪዑ!",
      subscriptionActivated: "ናይ ምቝጻር ምዝገባኻ ተግብሪ ኮይኑ ኣሎ።",
      redirectingToDashboard: "ናብ ዳሽቦርድ ይኸይድ ኣሎ...",
      planSummary: "ማጠቃለዊ ዕቅድ",
      mobileMoneyPayment: "ክፍሊት ሞባይል ገንዘብ",
      back: "ተመለስ",
      stepPhoneNumber: "ቁጽሪ ስልኪ",
      stepPaymentProcess: "ክፍሊት ኣብ ሂደት",
      stepConfirmation: "ምርግጋጽ",
    },
    stats: {
      happyClients: "ደስ ዝብሉ ደንበኛታት",
      successProjects: "ዝዓወቱ ፕሮጀክትታት",
      projectsCompleted: "ዝዛዕሙ ፕሮጀክትታት",
      successRate: "ምዕራፍ ዕወት",
    },
    pricing: {
      chooseYourPlan: "ናብ ዕቅድኻ",
      plan: "ምረጥ",
      selectPerfectPlan: "ንንግድ ድርጅትኻ ተስማሚ ዕቅድ ምረጥ። ብነጻ ጀምር ወይ ኣብ ዝዀነ እዋን ሓድሽ ምግባር።",
      startFreeOrUpgrade: "ብነጻ ጀምር ወይ ኣብ ዝዀነ እዋን ሓድሽ ምግባር።",
      freeTrial: "ነጻ ሙከራ",
      basicPlan: "መሰረታዊ ዕቅድ",
      premiumPlan: "ፕሪሚየም ዕቅድ",
      forever: "ንዘለኣለም",
      perMonth: "ብወርሒ",
      perfectForGettingStarted: "ንመጀመሪያ ተስማሚ",
      forGrowingBusinesses: "ንዚዓይዑ ንግዲ",
      forEnterpriseNeeds: "ንድርጅታዊ ድለይቲ",
      mostPopular: "ዝዓበየ ተፈታዊ",
      getStarted: "ጀምር",
      choosePlan: "ዕቅድ ምረጥ",
      postUpTo3JobsLifetime: "ክሳዕ 3 ስራታት ለጥቂት ጊዜ ምልጥፍ",
      multiPlatformPosting: "ኣብ ብዙሕ መድረኻት ምልጥፍ",
      browseFreelancerProfiles: "መገለጻታት ነጻ ሰራሕተኛታት ምድላይ",
      basicMessaging: "መሰረታዊ መልእኽቲ",
      standardSupport: "መደበኛ ድጋፍ",
      accessToJobListings: "ናብ ዝርዝር ስራታት ምእታው",
      postUpTo10JobsPerMonth: "ብወርሒ ክሳዕ 10 ስራታት ምልጥፍ",
      unlimitedFreelancerBrowsing: "ዘይተወሰነ ምድላይ ነጻ ሰራሕተኛታት",
      priorityMessaging: "ቅድሚ ዓቢ መልእኽቲ",
      prioritySupport: "ቅድሚ ዓቢ ድጋፍ",
      advancedSearchFilters: "ዝላዓለ ፍለጋ ማጣሪያታት",
      jobAnalyticsDashboard: "ዳሽቦርድ ትንተና ስራ",
      featuredJobListings: "ዝተለዩ ዝርዝር ስራታት",
      unlimitedJobPosts: "ዘይተወሰነ ልጥፍ ስራታት",
      unlimitedFreelancerAccess: "ዘይተወሰነ እታው ነጻ ሰራሕተኛታት",
      premiumMessagingVideoCalls: "ፕሪሚየም መልእኽቲ እና ቪድዮ ጻውዒታት",
      dedicatedSupport: "24/7 ዝተመደበ ድጋፍ",
      advancedAnalyticsInsights: "ዝላዓለ ትንተና እና ርእይቶታት",
      featuredPromotedListings: "ዝተለዩ እና ዝተደገፉ ዝርዝራት",
      customBrandingOptions: "ብጁ ኣማራጻት ምልክት",
      apiAccess: "እታው API",
      dedicatedAccountManager: "ዝተመደበ ኣስተዳዳሪ ኣካውንት",
      earlyAccessToNewFeatures: "ናብ ሓዱሽ ባህርያት ቀዳማይ እታው",
      frequentlyAskedQuestions: "ብተደጋጋሚ ዚሕተቱ ሕቶታት",
      canIChangePlansLater: "ዕቅድታት ድሕሪ ክለውን ይኽእል ድየ?",
      canIChangePlansLaterAnswer: "እወ! ዕቅድኻ ኣብ ዝዀነ እዋን ክትሓድስ ወይ ክትቐንስ ትኽእል ኢኻ። ለውጢታት ኣብ ዝቕጽል ዑደት ክፍሊትኻ ይንጸባረቁ።",
      whatPaymentMethodsDoYouAccept: "እንታይ ዓይነት ኣገባባት ክፍሊት ትቀበሉ?",
      whatPaymentMethodsDoYouAcceptAnswer: "ኣብ ኢትዮጵያ ኩሎም ዋና ዋና ክሬዲት ካርድታት፣ ዴቢት ካርድታት እና ኣገልግሎታት ሞባይል ገንዘብ ንቀበል።",
      isThereAContract: "ውሕል ኣሎ?",
      isThereAContractAnswer: "ውሕላት የለን! ምዝገባኻ ኣብ ዝዀነ እዋን ዘይቅጻት ክትቋርጽ ትኽእል ኢኻ።",
      doYouOfferRefunds: "መመለሲ ትህቡ?",
      doYouOfferRefundsAnswer: "እወ፣ ንኹሎም ዝከፈሉ ዕቅድታት 30 መዓልቲ ዋስትና መመለሲ ገንዘብ ንህብ።",
    },
    contactUs: {
      getInTouch: "ርኸብና",
      getInTouchWith: "ርኸብና",
      haveQuestions: "ብዛዕባ መድረኻና ሕቶታት ኣለኩም? ምስ ኣካውንትኹም ድጋፍ ትደልዩ? ኣብ ዓለም ነጻ ስራ ንምዕዋት እንሕግዝ ኣለና።",
      phone: "ስልኪ",
      email: "ኢመይል",
      office: "ቢሮ",
      businessHours: "ናይ ንግዲ ሰዓታት",
      monFriHours: "ሰኑይ-ዓርቢ 9AM-6PM EAT",
      respondWithin24Hours: "ኣብ 24 ሰዓታት ውስጥ ንመልስ",
      weekendSupportAvailable: "ድጋፍ ናይ ሰንበት ኣሎ",
      sendUsMessage: "መልእኽቲ ሰዲዱልና",
      fullName: "ምሉእ ስም",
      emailAddress: "ኢመይል ኣድራሻ",
      subject: "ርእሲ",
      message: "መልእኽቲ",
      selectSubject: "ርእሲ ምረጽ",
      generalInquiry: "ናይ ሓፈሻዊ ሕቶ",
      technicalSupport: "ድጋፍ ቴክኒካዊ",
      partnership: "ኣጋርነት",
      billingPayments: "ክፍሊት እና ክፍሊት",
      feedback: "ርእይቶ",
      other: "ካልእ",
      yourFullName: "ምሉእ ስምኻ",
      yourEmailPlaceholder: "your.email@example.com",
      tellUsHowWeCanHelp: "ከመይ ከም እንሕግዝካ ንገረና...",
      sending: "በመላክ ላይ...",
      sendMessage: "መልእኽቲ ሰዲድ",
      visitOurOffice: "ቢሮና ተጎብኡ",
      hustleXHQ: "HustleX ዋና ቢሮ",
      officeLocationDescription: "ኣብ ማእከል ወረዳ ንግዲ ኣዲስ ኣበባ ዘሎ ቢሮና ኣብ ኢትዮጵያ ዚዓይድ ስርዓት ነጻ ስራ ንፈጠራ እና ንትብብር ማእከላይ ማእከል እዩ።",
      openInGoogleMaps: "ኣብ Google Maps ክፈት",
      followUs: "ተኸተልና",
      needQuickAnswers: "ፈጻሚ መልሲ ትደልዩ?",
      checkOutFAQ: "ንተለመዱ ሕቶታት ፈጻሚ መልሲ ንምርካብ ናይ FAQ ክፍልና ርአዩ።",
      visitFAQ: "FAQ ተጎብኡ",
      validationFailed: "ማረጋገጥ ኣይተሳኪዑን:",
      failedToSendMessage: "መልእኽቲ ምስዳድ ኣይተሳኪዑን። በጃኻ እንደገና ፈትን።",
      failedToSendMessageCheckConnection: "መልእኽቲ ምስዳድ ኣይተሳኪዑን። በጃኻ ርክብኻ ፈትን እና እንደገና ፈትን።",
    },
    faq: {
      whatIsHustleX: "HustleX እንታይ እዩ?",
      whatIsHustleXAnswer: "HustleX ናይ ኢትዮጵያ ዋና መድረኽ ነጻ ስራ እዩ፣ ታላላቅ ነጻ ሰራሕተኛታት ኢትዮጵያ ምስ ንግድ ዓለም ይራኸብ። ደንበኛታት የበቁ ሙያዊዎችን ክረክቡ እና ነጻ ሰራሕተኛታት ክህሎታቶም ክሳዱ ዚኽእሉበት ደህንነቱ ዝተጠበቀ እና ኣስተማማኝ ገበያ ንህብ።",
      howDoIGetStartedAsFreelancer: "ከነጻ ሰራሕተኛ ከመይ ጌርኩም ክጀምሩ ይኽእሉ?",
      howDoIGetStartedAsFreelancerAnswer: "መጀመሪያ ቀሊል እዩ! ብቐሊል ነጻ ኣካውንት ፍጠሩ፣ መገለጻኹም ብክህሎትኹም እና ብልምድኹም ምሉእ ግበሩ፣ ናይ ክፍሊት ሓበሬታኹም ኣዘውትሩ፣ እና ኣብ ትርከብ ፕሮጀክትታት ምድላይ ጀምሩ። ንምትኩ ደንበኛታት ስራኹም ንምርኣይ ኣስደሳቲ የስራ ማስታወሻ እውን ክፍጠሩ ትኽእሉ።",
      howDoIPostJobAsClient: "ከንግዳዊ ደንበኛ ከመይ ጌርኩም ስራ ክልጥፉ ይኽእሉ?",
      howDoIPostJobAsClientAnswer: "ከንግዳዊ ደንበኛ፣ ኣካውንት ብምፍጣር፣ 'ስራ ምልጥፍ' ክፍሊ ናብ ምኻድ፣ እና ብዛዕባ ፕሮጀክትኹም ዝርዝር ሓበሬታ ምሃብ ስራታት ክትልጥፉ ትኽእሉ። እዚ ዝርዝር ሓበሬታ መስፈርትታት፣ በጀት፣ ናይ ጊዜ ሰሌዳ፣ እና ዘድልዩ ክህሎታት የጠቓልል። መድረኻና ምስ ብቑዓት ነጻ ሰራሕተኛታት ይዛምድኩም።",
      whatAreTheFees: "HustleX ንምጥቃም እንታይ ዓይነት ክፍሊትታት ኣለዉ?",
      whatAreTheFeesAnswer: "ንነጻ ሰራሕተኛታት፣ ናይ ኣገልግሎት ክፍሊት ኣይንከፍልን። ደንበኛታት ስራታት ብነጻ ክልጥፉ ይኽእሉ። ተወሳኺ ጥቕሚታት እና ዝቐንዐ ክፍሊትታት ዘለዎም ፕሪሚየም ኣባልነት እውን ንህብ። (ብቅርብ ጊዜ ይመጽእ)",
      whatCategoriesAvailable: "እንታይ ዓይነት የስራ ክፍሊታት ኣለዉ?",
      whatCategoriesAvailableAnswer: "ከ200 በላይ የተለያዩ ክህሎታት ኣብ ዋና ዋና ክፍሊታት ከም እዚ ዝስዕብ ንደግፍ፡ ልማት፣ ዲዛይን፣ ግብይት፣ ጽሑፍ፣ ሞባይል ልማት፣ ናይ ንግዲ ምክክር፣ ትርጉም፣ እና ብዙሕ ካልኦት ልዩ ኣገልግሎታት።",
      howDoICommunicate: "ምስ ነጻ ሰራሕተኛይ/ደንበኛይ ከመይ ጌርኩም ክገናኝ ይኽእሉ?",
      howDoICommunicateAnswer: "መድረኻና ንደህንነቱ ዝተጠበቀ ግንኙነት ዝተገንባ የመልእኽት መሳሪያታት የህብ። ነጻ ሰራሕተኛው እና ደንበኛው በዚ የመልእኽት መሳሪያታት ወይ በቀጥታ በኢመይል ክገናኙ ይኽእሉ።",
      whatIfNotSatisfied: "ካብ ስራ እንተ ዘይደስኩም?",
      whatIfNotSatisfiedAnswer: "ንኹሉ ጸገማት ንምቅልጥፍ ናይ ክርክር መፍትሒ ሂደት ኣለና። እንተ ዘይደስኩም፣ ማሻሻያታት ምሕታት ወይ ክርክር ምልኣኽ ትኽእሉ። ናይ ድጋፍ ጋንታና ይመራል እና ንክልቲኦም ወገናት ፍትሓዊ መፍትሒ ንምርካብ ይሰርሕ።",
      canIWorkInternationally: "ምስ ዓለም አቀፍ ደንበኛታት/ነጻ ሰራሕተኛታት ክሰርሕ ይኽእል ድየ?",
      canIWorkInternationallyAnswer: "ብግሁድ! HustleX ናይ ኢትዮጵያ ችሎታ ምስ ዓለም አቀፍ ደንበኛታት ይራኸብ።",
      isCustomerSupportAvailable: "የደንበኛ ድጋፍ ኣሎ?",
      isCustomerSupportAvailableAnswer: "እወ! በ24/7 የደንበኛ ድጋፍ ንህብ በእርዳታ ማእከላትና፣ ቀጥታ ውይይት፣ እና ኢመይል። ናይ ድጋፍ ጋንታና ብዛዕባ ነጻ ሰራሕተኛታት እና ደንበኛታት ድለይቲ ዝፈልጥ እዩ እና ንኹሉ ጸገማት ብፍጥነት ንምፍታሕ ይሕግዝ።",
      gotQuestions: "ሕቶታት ኣለኩም? መልሲ ኣለና!",
      gotAnswers: "ብዛዕባ ኣጠቓቕማ HustleX ንዝለዓሉ ልሙዳት ሕቶታት መልሲ ረኸቡ። ዝደለኹምዎ ክትረኽቡ ኣይከኣልኩምን? ንጋንታ ድጋፍና ኣዘራርቡ።",
      contactSupportDesc: "ጋንታ ድጋፍና ኣብ HustleX ክትዕወቱ ንምሕጋዝ ኣብዚ ኣለዉ።",
      stillHaveQuestions: "ገና ሕቶታት ኣለኩም?",
      howRatePlatform: "ንመድረኽና ከመይ ትግምግምዎ?",
      howRatePlatformAnswer: "ብኣገልግሎትና ንሕበን ኢና። ተጠቀምትና ብቐጻሊ ኣብ ኢትዮጵያ ከም ቀዳማይ መዕርፎ ነጻ ስራ ይምድቡና።",
      contactSupport: "ድጋፍ ኣግኝ",
      visitHelpCenter: "ማዕከል ሓገዝ ተጎብኡ",
    },
    helpCenter: {
      title: "እርዳታ ማዕከል",
      subtitle: "መልሶችን በፍጥነት ያግኙ፣ መመሪያዎችን ያስሱ፣ ትምህርታዊ ቪዲዮዎችን ይመልከቱ፣ እና ከHustleX የተሻለ ውጤት ያግኙ።",
      searchPlaceholder: "ንጽሑፋት ሓገዝ ድለይ...",
      gettingStarted: "መጀመሪያ",
      gettingStartedDesc: "ኣካውንት ፍጠር፣ መገለጻ ኣዘውትር፣ እና መሰረታዊ ነገራት።",
      usingHustleX: "HustleX ምጥቃም",
      usingHustleXDesc: "ስራታት፣ ሐሳባት፣ መልእኽቲ፣ እና ምስማር።",
      billingPayments: "ክፍሊት እና ክፍሊት",
      billingPaymentsDesc: "ክፍሊት ሰነዳት፣ ክፍሊት፣ እና ክርክር።",
      securitySafety: "ደህንነት እና ደህንነት",
      securitySafetyDesc: "ናይ ኣካውንት ምክልኻል እና ምርጥ ልምዲታት።",
      freelancerSuccess: "ናይ ነጻ ሰራሕተኛ ስኬት",
      freelancerSuccessDesc: "ንምብራር እና ስራ ንምዕዋት ምክርታት።",
      forClients: "ንደንበኛታት",
      forClientsDesc: "ምስማር፣ ፕሮጀክትታት ምምሕዳር፣ እና ክፍሊት።",
      popularArticles: "ታዋቂ ጽሑፎች",
      allCategories: "ኩሎም ክፍሊታት",
      browseByCategory: "ብክፍሊ ምርምር",
      frequentlyAskedQuestions: "ብተደጋጊሞም ዚጠየቁ ሕቶታት",
      views: "እይታታት",
      helpful: "ኣጋይ",
      readMore: "ተወሳኺ ኣንብብ",
      backToHelpCenter: "ናብ ማእከል ሓገዝ ተመለስ",
      noResultsFound: "ውጽኢት ኣይተረኽበን",
      tryDifferentSearch: "ካልእ ናይ ፍለጋ ቃል ፈትን",
    },
    aboutUs: {
      activeFreelancers: "ንቑሓት ናጻ ሰራሕተኛታት",
      ourStory: "ናይና ታሪኽ",
      ourStoryDescription: "ኣብ 2023 ዝተመስረተ HustleX ካብ ሓደ ቀሊል ሓሳብ ዝተላዕለ እዩ፡ ብቑዓት ሞያውያን ኢትዮጵያ ዝሓሸ ተበጻሕነት ዓለምለኻዊ ዕድላት ይግብኦም እዩ። ብድሆታት ባህላዊ ዕዳጋ ስራሕ ብኣካል ብምርኣይ፣ መስራቲና ነጻ ስራ ተበጻሒ፣ ፍትሓዊን መኽሰብ ዘለዎን ዝገብር መድረኽ ንምፍጣር ተበጊሱ። ገና ንጅምር እኳ እንተሃለና፣ HustleX ድሮ ብቑዓት ሞያውያን ምስ ደንበኛታት መላእ ዓለም ዘራኽብ ማሕበረሰብ ይሃንጽ ኣሎ። ተልእኾና ካብ ዕዳጋ ጥራይ ንላዕሊ እዩ - ሞያዊ ሓይሊ ዲጂታል ኢትዮጵያ ኣብ ዓለምለኻዊ ቁጠባ ክዕወት ዘኽእል ምንቅስቓስ ንፈጥር ኣለና።",
      ourMission: "ናይና ተልእኾ",
      ourMissionDescription: "ክእለት ምስ ዕድል ብምራኽ፣ ኢኮኖሚያዊ ዕብየትን ሞያዊ ልምምድን ብምብራትዕ፣ ውሑስን ፈጣሪን መድረኽ ብምሃብ ንኢትዮጵያውያን ናጻ ሰራሕተኛታትን ንግድታትን ንምብቃዕ።",
      ourValues: "ናይና እሴታት",
      innovation: "ፈጠራ",
      innovationDesc: "ንማሕበረሰብ ነጻ ስራ ዝላዓለ መፍትሒታት ንምሃብ ብቐጻሊ ንፈጥር።",
      community: "ማሕበረሰብ",
      communityDesc: "ክእለት ምስ ዕድል ዝራኸበሉ ደጋፊ ማሕበረሰብ ኣብ ኢትዮጵያን ካብኡ ንላዕሊን ምህናጽ።",
      excellence: "ብሉጽነት",
      excellenceDesc: "ፍሉይ ጽሬት ንምሃብን ሞያዊ ዕብየት ንምዕባይን ቁርጠኛታት ኢና።",
      globalReach: "ዓለምለኻዊ ተበጻሕነት",
      globalReachDesc: "ክእለት ኢትዮጵያውያን ምስ ዓለምለኻዊ ዕድላት ብመድረኽና ምትእስሳር።",
      meetOurTeam: "ቡድናችንን ይገናኙ",
      meetOurFounder: "ሊቀ መንበራችንን ይገናኙ",
      visionarySubtitle: "ንዲጂታል ሓይሊ ሰብ ኢትዮጵያ ንምብቃዕ ዝተወፈየ ተኸታታሊ HustleX",
      founder: "ሊቀ መንበር",
      founderName: "ዮሃንስ ፍቅሬ",
      founderBio: "ክእለት ምስ ዕድል ንምርኻብ ብዘለኒ ድሌት ተደፋፊአ፣ ኣብ ኢትዮጵያን ካብኡ ወጻኢን ንዘለዉ ፍሪላንሰርን ደንበኛታትን ንምብቃዕ HustleX ፈጢረ። ዕላማይ ቀሊል እዩ፡ ስራሕ ምርካብን ተውህቦ ምርካብን ስሉጥ፣ ፍትሓዊን ኣነቃቕን ምግባር። ኣብ HustleX ዝግበር ነፍሲ ወከፍ ርክብ ናብ ዕብየት፣ ፈጠራን ዓወትን ዝግበር ስጉምቲ እዩ።",
      founderCEO: "ፈጣሪ እና ሊቀ መንበር",
      frontendDeveloper: "የፊት አካል አዳዲስ",
      fullstackDeveloper: "ሙሉ አቅርቦት አዳዲስ",
      visionaryLeaderBio: "5+ ዓመታት ኣብ ቴክ ስራ ዝተሞላ ራዕይ ዘለዎ መራሒ፣ ኢትዮጵያውያን ክህሎት ንምብቃዕ ዝፈቱ።",
      frontendDeveloperBio: "ኣብ React፣ JavaScript፣ HTML፣ እና CSS ዝበቁ የፊት አካል አዳዲስ፣ ንጹህ፣ ምላሽ ዚህብ እና ንተጠቃሚ ዚመች የድር መተግበሪያታት ዚፈጥር።",
      fullstackDeveloperBio: "ንዚዓይድ ማሕበረሰብና ሓያል፣ ክሰፍሕ ዝኽእል መፍትሒታት ዝሃንጽ ሙሉእ አቅርቦት አዳዲስ።",
    },
    signup: {
      createAccount: "ኣካውንት ፍጠር",
      welcomeBack: "እንኳዕ ብደሓን መጻእኩም",
      loginToContinue: "ንምቀጻል እተዓቅብ",
      joinHustleX: "HustleX ተቀላቀልን ናይ ነጻ ስራ ጉዕዞኻ ጀምርን",
      freelancer: "ነጻ ሰራሕተኛ",
      client: "ደንበኛ",
      signUp: "ተመዝግብ",
      signUpWithGoogle: "ብGoogle ተመዝግብ",
      signUpWithApple: "ብApple ተመዝግብ",
      comingSoon: "(ኣብ ቀረባ እዋን ክመጽእ)",
      useYourEmail: "ኢመይልካ ተጠቐም",
      email: "ኢመይል",
      password: "መሕለፊ ቃል",
      confirmPassword: "መሕለፊ ቃል ኣረጋግጽ",
      firstName: "ናይ መጀመሪያ ስም",
      lastName: "ናይ ኣያት ስም",
      iWantTo: "ደልየ ኣለኹ:",
      findWork: "ስራ ረክብ",
      hireFreelancers: "ነጻ ሰራሕተኛታት ስማር",
      creatingAccount: "ኣካውንት ይፈጥር...",
      alreadyHaveAccount: "ኣካውንት ኣለካ? ኢመይልካ ኣብ ላዕሊ ኣእቱ እሞ እተዓቅብ",
      signIn: "እተዓቅብ",
      forgotPassword: "መሕለፊ ቃል ረሲዕካ?",
      signingIn: "እናተዓቅብ ኣለና...",
      accountFound: "ኣካውንት ተረኺቡ",
      accountExistsMessage: "ብዛዕባ እዚ ኢመይል ኣካውንት ኣሎ። ክትገብር ትኽእል:",
      continueWithExistingRole: "ብነባሪ ሚና ቀጻሊ:",
      account: "ኣካውንት",
      orAddNewRole: "ወይ ሓድሽ ሚና ወስኽ:",
      addFreelancerRole: "ናይ ነጻ ሰራሕተኛ ሚና ወስኽ",
      offerServices: "ኣገልግሎትካ ሃብ እሞ ስራ ረክብ",
      add: "ወስኽ",
      addClientRole: "ናይ ደንበኛ ሚና ወስኽ",
      hireFreelancersAndPost: "ነጻ ሰራሕተኛታት ስማር እሞ ስራታት ለጥፍ",
      backToAccountSelection: "ናብ ምርጫ ኣካውንት ተመለስ",
      signInToAddRole: "ናይ {role} ሚና ንምውሳኽ እተዓቅብ",
      signInToContinue: "ከም {role} ንምቀጻል እተዓቅብ",
      pleaseEnterPassword: "በጃኻ መሕለፊ ቃልካ ኣእቱ",
      passwordsDoNotMatch: "መሕለፊ ቃላት ኣይሰማማዕን",
      passwordRequirements: "መሕለፊ ቃል እንተወሓደ 8 ቁምፊታት ክኸውን እሞ እንተወሓደ ሓደ ፊደል እሞ ሓደ ቁጽሪ ክህልዎ ኣለዎ",
      accountAlreadyExists: "ብዛዕባ እዚ ኢመይል ኣካውንት ኣሎ። በጃኻ ካብ ላዕሊ ካሎ ኣካውንትታት ምረጽ",
      failedToCreateAccount: "ኣካውንት ምፍጣር ኣይተሳነየን። በጃኻ እንደገና ፈትን",
      tooManyRequests: "ዝያዳ ሕቶታት። በጃኻ ቁሩብ ተጸበይ እሞ እንደገና ፈትን",
      invalidEmailOrPassword: "ዘይቅኑዕ ኢመይል ወይ መሕለፊ ቃል። በጃኻ እንደገና ፈትን",
      googleSignupFailed: "ብGoogle ምመዝግብ ኣይተሳነየን: {error}",
      googleSignupComingSoon: "ብGoogle ምመዝግብ ኣብ ቀረባ እዋን ክተግበር እዩ። በጃኻ ኢመይል/መሕለፊ ቃል ተጠቐም",
    },
    login: {
      login: "እተዓቅብ",
      signInWithGoogle: "ብGoogle እተዓቅብ",
      signInWithApple: "ብApple እተዓቅብ",
      comingSoon: "(ኣብ ቀረባ እዋን ክመጽእ)",
      useYourEmail: "ኢመይልካ ተጠቐም",
      email: "ኢመይል",
      password: "መሕለፊ ቃል",
      forgotPassword: "መሕለፊ ቃል ረሲዕካ?",
      signingIn: "እናተዓቅብ ኣለና...",
      signIn: "እተዓቅብ",
      dontHaveAccount: "ኣካውንት የብልካን?",
      signUp: "ተመዝግብ",
      incorrectEmailOrPassword: "ዘይቅኑዕ ኢመይል ወይ መሕለፊ ቃል። በጃኻ እንደገና ፈትን",
      googleLoginFailed: "ብGoogle ምእታው ኣይተሳነየን",
      googleLoginComingSoon: "ብGoogle ምእታው ኣብ ቀረባ እዋን ክተግበር እዩ። በጃኻ ኢመይል/መሕለፊ ቃል ተጠቐም",
      failedToAddRole: "ሚና ምውሳኽ ኣይተሳነየን። በጃኻ እንደገና ፈትን",
    },
    postJob: {
      postAJob: "ስራ ለጥፍ",
      createJobListing: "ዝርዝር ስራኻ ፍጠር",
      checkingAuthentication: "ማረጋገጥ እየተፈተነ ነው...",
      jobTitle: "ዝርዝር ስራ *",
      enterJobTitle: "ዝርዝር ስራ ኣእቱ",
      companyName: "ዝርዝር ኩባንያ *",
      enterCompanyName: "ዝርዝር ኩባንያ ኣእቱ",
      category: "ምድብ *",
      selectCategory: "ምድብ ምረጽ",
      jobType: "ዓይነት ስራ *",
      selectJobType: "ዓይነት ስራ ምረጽ",
      experienceLevel: "ደረጃ ልምዲ *",
      selectExperience: "ደረጃ ልምዲ ምረጽ",
      salaryRange: "ክልል ደሞዝ *",
      enterSalaryRange: "ክልል ደሞዝ ኣእቱ (ንኣብነት: 50,000-70,000 ETB)",
      description: "መግለጺ *",
      enterDescription: "መግለጺ ስራ ኣእቱ",
      deadline: "ዕለት መወዳእታ *",
      selectDeadline: "ዕለት መወዳእታ ምረጽ",
      workLocation: "ከባቢ ስራ *",
      selectWorkLocation: "ከባቢ ስራ ምረጽ",
      skills: "ኣገዳስነት ብልሒታት",
      selectSkills: "ኣገዳስነት ብልሒታት ምረጽ",
      gender: "መረጋገጺ ጾታ",
      selectGender: "መረጋገጺ ጾታ ምረጽ",
      vacancies: "ቁጽሪ ባዶ ቦታታት",
      enterVacancies: "ቁጽሪ ባዶ ቦታታት ኣእቱ",
      address: "ኣድራሻ",
      enterAddress: "ኣድራሻ ኣእቱ",
      country: "ሃገር *",
      selectCountry: "ሃገር ምረጽ",
      city: "ከተማ",
      enterCity: "ከተማ ኣእቱ",
      jobLink: "ኣገናኝ ስራ (ኣማራጺ)",
      enterJobLink: "ኣገናኝ ስራ ኣእቱ (እንተ ኣሎ)",
      visibility: "ርእይቶ",
      public: "ወግዓዊ",
      private: "ውልቃዊ",
      postJob: "ስራ ለጥፍ",
      posting: "እናለግፍ ኣለና...",
      errorPostingJob: "ስራ ምለግፍ ጌጋ።",
      lifetimeLimitReached: "እዚ ድማ ዕለታዊ ገደብ እዩ። ተወሳኺ ስራታት ንምለግፍ ናይ ክፍሊት እቅድ ክትሻሽል ኣለኻ።",
      upgradeToPostMore: "ስራታት ንምቀጻል እቅድኻ ሻሽል።",
      upgradePlan: "እቅድ ሻሽል",
      required: "የድሊ",
    },
  },
  om: {
    nav: {
      home: "Mana",
      aboutUs: "Waa'ee Keenya",
      exploreJobs: "Hojiiwwan Himaali",
      pricing: "Gatii",
      blog: "Blog",
      faq: "Gaaffilee",
      howItWorks: "Akka Itti Hojjattu",
      contact: "Nu Qunnamsiisi",
      findFreelancers: "Hojjattoota Bilisaa Himaali",
      logIn: "Seenu",
      signUp: "Galmaa'i",
    },
    hero: {
      title: "Ogummaan hojjedhaa",
      titleHighlight: "Saffisaan hojjedhaa",
      subtitle: "Daldaltoota waliin ogummaa guddaa Itoophiyaa waliin qunnamsiisuu",
      subtitleHighlight: "ogummaa 200+ ol irratti.",
      getStarted: "Eegalee",
      findTalent: "Ogummaa Himaali",
      joinAsFreelancer: "Hojjattaa Bilisaa Ta'uun Makamu",
    },
    features: {
      title: "Maaliif HustleX Filattu?",
      subtitle: "Hunduu bakka hojii bilisaa keessatti milkaa'uu barbaachisu",
      postJobs: {
        title: "Hojiiwwan Salphaan Baasii",
        desc: "Hojiiwwan dhibbaan keessatti uumuu fi baasuu. Hojjattaa gaarii projeektiif keessan argadhuu.",
      },
      findTalent: {
        title: "Ogummaa Guddaa Himaali",
        desc: "Hojjattoota kumootaan lakkaa'aman hojiiwwan keessan irratti hojjachuuf qophaa'aan himaali.",
      },
      securePayments: {
        title: "Kaffaltiinsa Nageenyaan",
        desc: "Sisteemiin kaffaltii nageenyaan fi amanamaa qabxiiwwan lamaanis eegumsa qabu.",
      },
      realTimeChat: {
        title: "Haqqii Yeroo Haaqaawaa",
        desc: "Hojjattoota bilisaa fi garee keessan waliin haala salphaan haasawu, video call gochuufi walitti fufu.",
      },
    },
    categories: {
      title: "Gareen Himaali",
      subtitle: "Hojjattoota bilisaa bakka keessan keessatti himaali",
      freelancers: "Hojjattoota Bilisaa",
      popularCategories: "Gareewwan Hojii Bilisaa Beekamoo",
      development: "Fooyya'iinsa",
      design: "Saayinsii",
      marketing: "Gabaasaa",
      mobile: "Mobiilii",
      writing: "Barreessuu",
      translation: "Hiika",
      business: "Daldala",
      consulting: "Gorsa",
      adminSupport: "Gargaarsa Bulchiinsa",
      eliteFreelancers: "Hojjattoota Bilisaa Ol'aantummaa",
    },
    testimonials: {
      title: "Fayyadamiin Keenyas Maal Jettu?",
      subtitle: "Hojjattoota bilisaa milkaa'aniifi daldaltoota kumootaan lakkaa'aman HustleX irratti makamu",
      list: [
        {
          quote: "HustleX torban tokko qofa keessatti kaffaltii guddaa kaffalan maamiloota akkan argadhu na gargaareera! Platform-ichi salphaa fi nageenya qaba.",
          name: "Abebe Kebede",
          role: "Hojjattaa Bilisaa",
        },
        {
          quote: "Hojii post gochuu fi hojjattoota bilisaa ogummaa qaban waliin walqunnamuun kanaan dura salphatee hin beeku. Baay'ee gurguddaa dha!",
          name: "Selam Tesfaye",
          role: "Daldalaa",
        },
      ],
    },
    featuredFreelancers: {
      title: "Hojjattoota Bilisaa Ol'aantummaa",
      yohannes: { name: "Yohannes", title: "Hojjechuu Guutuu", rate: "$28/hr" },
      samuel: { name: "Samuel T.", title: "Hojjechuu Guutuu", rate: "$25/hr" },
      messi: { name: "Messi", title: "Duraan Hojjechuu", rate: "$30/hr" },
      lily: { name: "Lily M.", title: "UI/UX Designer", rate: "$30/hr" },
    },
    howItWorks: {
      title: "Akka Itti Hojjattu",
      subtitle: "HustleX akka safara hojii bilisaa keessanti sekondii 60 keessanti akka jijjiiramu agarsiisuuf video gaarii kana ilaalaa!",
      videoSubtitle: "HustleX",
      steps: {
        signUp: { title: "Hojiiwwan Hordofi", desc: "Hojiiwwan bilisaa adda addaa qaxartootaan baafaman sakatta'i. Ogummaa kee waliin kan deemu argachuuf kallaattiiwwan fayyadami." },
        browse: { title: "Iyyadhu ykn Baasi", desc: "Hojjattoonni bilisaa hojii ogummaa isaanii waliin deemu irratti iyyachuu danda'u, qaxartoonni immoo hojii haaraa odeeffannoo barbaachisu hundaa waliin baasuu danda'u." },
        connect: { title: "Walqunnamaa fi Hojjedhaa", desc: "Mootummaa keenya keessatti nageenyaan walqunnamaa, hojiiwwan xumuraa, fi hojii qulqullina qabu dhiyeessaa." },
        succeed: { title: "Kaffaltii Argadhu", desc: "Hojiin xumuramee erga mirkanaa'ee booda, kaffaltii keessan kallattiin qaxartoo keessan waliin mijeessuu danda'u." },
      },
    },
    companies: {
      trustedBy: "Ol'aantummaa",
      companies: "Kompaniiwwan Amantaa",
    },
    cta: {
      title: "Eegalee Qophaa'aa Ta'ee?",
      subtitle: "Gareen guddaa Itoophiyaa hojjattoota bilisaa ogummaa qabanifi daldaltoota makamu",
      subtitleHighlight: "Safara milkaa'inaa keessan eegalee!",
      getStarted: "Har'a Eegalee",
      learnMore: "Dabalataan Baradhuu",
      findDreamWork: "Hojii Hawwii Himaali",
    },
    footer: {
      description: "HustleX - Ogummaa waliin carraa Itoophiyaa fi alaatti qunnamsiisuu.",
      quickLinks: "Linkkeewwan Saffisaan",
      resources: "Qabeenya",
      followUs: "Nu Hordofaa",
      allRightsReserved: "Hundumtuu mirgaan kan eegamuudha.",
      forClients: "Daldaltootaaf",
      forFreelancers: "Hojjattoota Bilisaa",
      company: "Kompanii",
      howToHire: "Akka Hojjattaa Hire Gochu",
      talentMarketplace: "Ogummaa Baasii",
      howToFindWork: "Akka Hojii Argattu",
      freelanceJobs: "Hojiiwwan Bilisaa",
      aboutUs: "Waa'ee Keenya",
      careers: "Hojiiwwan",
      contactUs: "Nu Qunnamsiisi",
      helpCenter: "Gargaarsa",
      blog: "Blog",
      community: "Haala",
      api: "API Barreeffama",
      madeWith: "Waliin",
      inEthiopia: "Itoophiyaa keessatti hojjame",
    },
    common: {
      language: "Afaan",
      darkMode: "Moodi Garaacha",
      loading: "Fayyadamuu...",
      error: "Dogoggora",
      success: "Milkaa'ina",
    },
    payment: {
      backToPricing: "Gatii Deebi'i",
      completePayment: "Kaffaltiinsa Xumuri",
      choosePaymentMethod: "Galmee'uuf filatamte kaffaltiinsa filadhuu",
      payWithTelebirr: "Telebirr mobile moneyn kaffali",
      phoneNumber: "Lakkoofsi Bilbila",
      enterPhoneNumber: "Lakkoofsa bilbila keessan galchaa",
      enterPhoneNumberPlaceholder: "Lakkoofsa bilbila keessan galchaa",
      continue: "Itti Fufi",
      paymentRequestSent: "Gaaffii Kaffaltiinsa Ergame",
      paymentRequestSentTo: "Gaaffii kaffaltiinsa gara",
      checkPhoneAndEnterPin: "Mee bilbila keessan ilaalaa fi kaffaltiinsa mirkaneessuuf PIN galchaa.",
      waitingForConfirmation: "Mirkaneessuu kaffaltiinsa eegaa...",
      paymentSuccessful: "Kaffaltiinsa Milkaa'e!",
      subscriptionActivated: "Galmee'uu keessan hojjii irra ooleera.",
      redirectingToDashboard: "Dashboard deebi'aa...",
      planSummary: "Gidduu Karoora",
      mobileMoneyPayment: "Kaffaltiinsa mobile money",
      back: "Deebi'i",
      stepPhoneNumber: "Lakkoofsi Bilbila",
      stepPaymentProcess: "Kaffaltiinsa Hojjii Keessaa",
      stepConfirmation: "Mirkaneessuu",
    },
    stats: {
      happyClients: "Daldaltoota Gammadaa",
      successProjects: "Projeektiwwan Milkaa'ani",
      projectsCompleted: "Projeektiwwan Xumuraman",
      successRate: "Hir'ina Milkaa'inaa",
    },
    pricing: {
      chooseYourPlan: "Karaa Keessan",
      plan: "Filadhaa",
      selectPerfectPlan: "Karaa gaarii kan dhaabbata keessanif ta'e filadhaa. Bilisummaan eegalaa ykn yeroo kamillee guddifadhaa.",
      startFreeOrUpgrade: "Bilisummaan eegalaa ykn yeroo kamillee guddifadhaa.",
      freeTrial: "Mallattoo Bilisummaa",
      basicPlan: "Karaa Bu'uuraa",
      premiumPlan: "Karaa Premium",
      forever: "yeroo hundaaf",
      perMonth: "ji'a tokkotti",
      perfectForGettingStarted: "Eegumsaaf gaariidha",
      forGrowingBusinesses: "Dhaabbonni guddisanif",
      forEnterpriseNeeds: "Fe'umsa enterpriseef",
      mostPopular: "BAYYEE BEKKAMUU",
      getStarted: "Eegalaa",
      choosePlan: "Karaa Filadhaa",
      postUpTo3JobsLifetime: "Hojiiwwan 3 hanga (murtii jireenyaa)",
      multiPlatformPosting: "Galchiinsa platformi baay'ee",
      browseFreelancerProfiles: "Saaxiluu profilee hojjattoota bilisaa",
      basicMessaging: "Ergsiinsa bu'uuraa",
      standardSupport: "Gargaarsa sadarkaa",
      accessToJobListings: "Argachuu galchiinsa hojiiwwanii",
      postUpTo10JobsPerMonth: "Ji'a tokkotti hojiiwwan 10 hanga galchisiisuu",
      unlimitedFreelancerBrowsing: "Saaxiluu hojjattoota bilisaa hin madaalamne",
      priorityMessaging: "Ergsiinsa muraasaa",
      prioritySupport: "Gargaarsa muraasaa",
      advancedSearchFilters: "Filtaara barbaachisaa ol'aanaa",
      jobAnalyticsDashboard: "Dashboard analytics hojiiwwanii",
      featuredJobListings: "Galchiinsa hojiiwwanii adda ta'an",
      unlimitedJobPosts: "Galchiinsa hojiiwwanii hin madaalamne",
      unlimitedFreelancerAccess: "Argachuu hojjattoota bilisaa hin madaalamne",
      premiumMessagingVideoCalls: "Ergsiinsa premium & waamii videoo",
      dedicatedSupport: "Gargaarsa 24/7 kan qophaa'e",
      advancedAnalyticsInsights: "Analytics & hubannoo ol'aanaa",
      featuredPromotedListings: "Galchiinsa adda ta'an & guddisamoo",
      customBrandingOptions: "Filannoo branding custom",
      apiAccess: "Argachuu API",
      dedicatedAccountManager: "Bulchiinsa akaawuntii kan qophaa'e",
      earlyAccessToNewFeatures: "Argachuu jalqabaa meeqa haaraa",
      frequentlyAskedQuestions: "Gaaffilee Yeroo Baay'ee Gaafataman",
      canIChangePlansLater: "Karaa kana booda jijjiiraa?",
      canIChangePlansLaterAnswer: "Eeyyeen! Karaa keessan yeroo kamillee guddisuu ykn gadi buusuu ni dandeessu. Jijjiiramni kana booda karaa kaffaltii keessan keessatti mul'ata.",
      whatPaymentMethodsDoYouAccept: "Mallattoolee kaffaltii maal fudhattu?",
      whatPaymentMethodsDoYouAcceptAnswer: "Kaardii kreeditii, kaardii debiitii, fi tajaajila qarshii mobilaa hunduu kan Itoophiyaa keessatti jiran fudhanna.",
      isThereAContract: "Hiramni jira?",
      isThereAContractAnswer: "Hiramni hin jiru! Galma keessan yeroo kamillee kaffaltiin ala dhaabbachuu ni dandeessu.",
      doYouOfferRefunds: "Deebii kaffaltii ni kennituu?",
      doYouOfferRefundsAnswer: "Eeyyeen, karaa kaffaltii hundaaaf warrummaan deebii kaffaltii guyyaa 30 kennina.",
    },
    helpCenter: {
      searchPlaceholder: "Odeeffannoo gargaarsa barbaadi...",
      gettingStarted: "Eegumsa",
      gettingStartedDesc: "Akkaawuntii uumaa, profilee saaxilaa, fi bu'uura.",
      usingHustleX: "HustleX Fayyadamuu",
      usingHustleXDesc: "Hojiiwwan, iyyannoonni, ergaasni, fi hirmaachisuu.",
      billingPayments: "Kaffaltiinsa & Kaffaltiinsa",
      billingPaymentsDesc: "Invoosii, baasii, fi wal'aansoo.",
      securitySafety: "Eegumsa & Nagaa",
      securitySafetyDesc: "Eegumsa akkaawuntii fi haala gaariidhaan hojjechuu.",
      freelancerSuccess: "Milkaa'ina Hojjattaa Bilisaa",
      freelancerSuccessDesc: "Gorsa hojii argachuuf adda baasuu fi milkaa'inaa.",
      forClients: "Daldaltootaaf",
      forClientsDesc: "Hirmaachisuu, projeektiwwan bulchiisuu, fi kaffaltiinsa.",
      popularArticles: "Odeeffannoonni Beekamoo",
      allCategories: "Gareewwan Hundaa",
      browseByCategory: "Garee Irratti Ilaali",
      frequentlyAskedQuestions: "Gaaffilee Yeroo Baay'ee Gaafataman",
      views: "ilaalannoo",
      helpful: "gargaarsa",
      readMore: "Dabalataan Dubbisi",
      backToHelpCenter: "Gargaarsa Deebi'i",
      noResultsFound: "Himannoon hin argamne",
      tryDifferentSearch: "Jecha barbaachisaa adda fayyadami",
    },
    aboutUs: {
      activeFreelancers: "Hojjattoota Bilisaa Hojjii Keessaa Jiran",
      ourStory: "Seenaa Keenya",
      ourStoryDescription: "HustleX bara 2023 yaada salphaa irraa dhalate: ogummaa Itoophiyaa carraa addunyaa waliin walitti makuu. Rakkoo gabaa hojii aadaa keessa jiru hubachuun, hundeeffamaan keenya hojii bilisaa hundaaf dhiyaatu, haqa qabuu fi bu'aa qabu uumuuf ka'e. Hati nuti amma eegallu iyyuu, HustleX duba ogummaa qaban daldaltoota addunyaa waliin walitti makuun garee guddaa ijaaraa jira. Ergaan keenya gabaa qofa miti - humna namaa dijiitaalaa Itoophiyaa dinagdee addunyaa keessatti akka milkaa'an sochoosii uumaa jirra.",
      ourMission: "Ergaa Keenya",
      ourMissionDescription: "Hojjattoota bilisaa Itoophiyaa fi daldaltoota bilisummaan, eegumsa qabu, platformii haaraa ta'e ogummaa carraa waliin walitti makuu, guddina dinagdee fi guddina ogummaa guddisuun humneessuu.",
      ourValues: "Naafiyyaa Keenya",
      innovation: "Uumama Haaraa",
      innovationDesc: "Gareewwan bilisummaaaf qooda guddaa qaban haaraa haaraa kennina.",
      community: "Hawaasa",
      communityDesc: "Ogummaa carraa Itoophiyaa fi alaatti walitti makuu gargaarsa qabu hawaasa ijaaruu.",
      excellence: "Qulqullina",
      excellenceDesc: "Qulqullina adda ta'e kennuu fi guddina ogummaa guddisuuf of kennuun hojjechuu.",
      globalReach: "Dhaqqabbii Addunyaa",
      globalReachDesc: "Ogummaa Itoophiyaa carraa addunyaa waliin platformii keenyaan walitti makuu.",
      meetOurTeam: "Garee Keenya Qunnamsiisi",
      meetOurFounder: "Hundeeffamaa keenya qunnamsiisaa",
      visionarySubtitle: "Humna namaa dijiitaalaa Itoophiyaa humneessuuf kan of kenne abbaa mul'ataa HustleX",
      founder: "Hundeeffamaa",
      founderName: "Yohannes Fikre",
      founderBio: "Ogummaa carraa waliin walqunnamsiisuuf fedhii qabaachuu kootiin, Itoophiyaa fi alaatti hojjattoota bilisaa fi maamiloota humneessuuf HustleX uume. Galmi koo salphaadha: hojii barbaaduun fi ogummaa argachuun qunnamtii toora, fithaawii fi kaka'umsa qabu gochuudha. HustleX irratti, walitti dhufeenyi hundi gara guddinaa, uumamaa fi milkaa'inaatti tarkaanfii tokkodha.",
      founderCEO: "Hundeeffamaa & CEO",
      frontendDeveloper: "Duraan Hojjechuu",
      fullstackDeveloper: "Hojjechuu Guutuu",
      visionaryLeaderBio: "Hogganaa mul'ata qabuu fi waggaa 5+ teknooloojii keessa turen, ogummaa Itoophiyaa humneessuuf fedhii qabu.",
      frontendDeveloperBio: "Hojjechuu duraan React, JavaScript, HTML, fi CSS keessatti ogummaa qaba, qulqullina, deebii kennaa, fi fayyadamaa irratti hojjataa weebii ijaaruu.",
      fullstackDeveloperBio: "Hojjechuu guutuu hawaasa keenya guddisaa keessatti furmaata cimmaa fi babal'achuu danda'u ijaaruu.",
    },
    signup: {
      createAccount: "Akkaawuntii Uumaa",
      welcomeBack: "Baga Nagaan Dhufte",
      loginToContinue: "Itti Fufuuf Seenuu",
      joinHustleX: "HustleX Makamuufi Hojii Bilisaa Keessan Eegalee",
      freelancer: "Hojjattaa Bilisaa",
      client: "Daldalaa",
      signUp: "Galmaa'aa",
      signUpWithGoogle: "Google Waliin Galmaa'aa",
      signUpWithApple: "Apple Waliin Galmaa'aa",
      comingSoon: "(Fuula Duraan)",
      useYourEmail: "Imeelii Keessan Fayyadami",
      email: "Imeelii",
      password: "Jecha Iccitii",
      confirmPassword: "Jecha Iccitii Mirkaneessi",
      firstName: "Maqaa Jalqabaa",
      lastName: "Maqaa Waggaa",
      iWantTo: "Barbaada:",
      findWork: "Hojii Barbaadi",
      hireFreelancers: "Hojjattoota Bilisaa Hire",
      creatingAccount: "Akkaawuntii Hojjechuu...",
      alreadyHaveAccount: "Akkaawuntii qabdaa? Imeelii keessan ol kaasaa seenaa.",
      signIn: "Seenii",
      forgotPassword: "Jecha Iccitii Dagachaa?",
      signingIn: "Seenuu...",
      accountFound: "Akkaawuntii Argame",
      accountExistsMessage: "Akkaawuntii imeelii kana qaba. Odoo hin taane:",
      continueWithExistingRole: "Hojii jiruun itti fufi:",
      account: "Akkaawuntii",
      orAddNewRole: "Ykn hojii haaraa akkaawuntii keessan keessatti dabaluu:",
      addFreelancerRole: "Hojii Hojjattaa Bilisaa Dabaladhu",
      offerServices: "Tajaajila keessan kennadhaa fi hojii argadhaa",
      add: "Dabaladhu",
      addClientRole: "Hojii Daldalaa Dabaladhu",
      hireFreelancersAndPost: "Hojjattoota bilisaa hire fi hojiiwwan post",
      backToAccountSelection: "Filannoo Akkaawuntii Deebi'i",
      signInToAddRole: "Hojii {role} dabaluuf seenaa",
      signInToContinue: "Akkuma {role} itti fufuuf seenaa",
      pleaseEnterPassword: "Mee jecha iccitii keessan galchaa",
      passwordsDoNotMatch: "Jechootni iccitii wal hin qabatanu",
      passwordRequirements: "Jecha iccitii yeroo tokko 8 qaamolee qabaachuu qaba fi yeroo tokko herrega tokko fi lakkoofsi tokko qabaachuu qaba",
      accountAlreadyExists: "Akkaawuntii imeelii kana qaba. Mee ol jiru akkaawuntiiwwan irraa filadhu",
      failedToCreateAccount: "Akkaawuntii uumuu hin milkaa'ine. Mee irra deebi'i",
      tooManyRequests: "Gaaffilee baay'ee. Mee tursi'i fi irra deebi'i",
      invalidEmailOrPassword: "Imeelii ykn jecha iccitii dogoggora. Mee irra deebi'i",
      googleSignupFailed: "Google Waliin Galmaa'uu hin milkaa'ine: {error}",
      googleSignupComingSoon: "Google Waliin Galmaa'uu fuula duraan ni hojjata. Mee imeelii/jecha iccitii fayyadami",
    },
    login: {
      login: "Seenii",
      signInWithGoogle: "Google Waliin Seenii",
      signInWithApple: "Apple Waliin Seenii",
      comingSoon: "(Fuula Duraan)",
      useYourEmail: "Imeelii Keessan Fayyadami",
      email: "Imeelii",
      password: "Jecha Iccitii",
      forgotPassword: "Jecha Iccitii Dagachaa?",
      signingIn: "Seenuu...",
      signIn: "Seenii",
      dontHaveAccount: "Akkaawuntii hin qabduu?",
      signUp: "Galmaa'aa",
      incorrectEmailOrPassword: "Imeelii ykn jecha iccitii dogoggora. Mee irra deebi'i",
      googleLoginFailed: "Google Waliin Seenuu Hin Milkaa'ine",
      googleLoginComingSoon: "Google Waliin Seenuu fuula duraan ni hojjata. Mee imeelii/jecha iccitii fayyadami",
      failedToAddRole: "Hojii dabaluu hin milkaa'ine. Mee irra deebi'i",
    },
    postJob: {
      postAJob: "Hojii Post",
      createJobListing: "Gabaasa Hojii Keessan Uumaa",
      checkingAuthentication: "Mirkaneessuu...",
      jobTitle: "Maqaa Hojii *",
      enterJobTitle: "Maqaa hojii galchaa",
      companyName: "Maqaa Kompanii *",
      enterCompanyName: "Maqaa kompanii galchaa",
      category: "Garee *",
      selectCategory: "Garee filadhu",
      jobType: "Gosa Hojii *",
      selectJobType: "Gosa hojii filadhu",
      experienceLevel: "Guddina Odeeffannoo *",
      selectExperience: "Guddina odeeffannoo filadhu",
      salaryRange: "Giddugaleessa Hojii *",
      enterSalaryRange: "Giddugaleessa hojii galchaa (fakkaataa: 50,000-70,000 ETB)",
      description: "Ibsa *",
      enterDescription: "Ibsa hojii galchaa",
      deadline: "Guyyaa Xumuraa *",
      selectDeadline: "Guyyaa xumuraa filadhu",
      workLocation: "Bakka Hojii *",
      selectWorkLocation: "Bakka hojii filadhu",
      skills: "Odeeffannoo Barbaachisan",
      selectSkills: "Odeeffannoo barbaachisan filadhu",
      gender: "Filannoo Saala",
      selectGender: "Filannoo saala filadhu",
      vacancies: "Lakkoofsi Bakka Hojii",
      enterVacancies: "Lakkoofsa bakka hojii galchaa",
      address: "Teessoo",
      enterAddress: "Teessoo galchaa",
      country: "Biyyoolessaa *",
      selectCountry: "Biyyoolessaa filadhu",
      city: "Magaalaa",
      enterCity: "Magaalaa galchaa",
      jobLink: "Link Hojii (Filannoo)",
      enterJobLink: "Link hojii galchaa (yoo ta'e)",
      visibility: "Ilaalchisa",
      public: "Hundeen",
      private: "Ofii",
      postJob: "Hojii Post",
      posting: "Postuu...",
      errorPostingJob: "Dogoggora hojii postuu.",
      lifetimeLimitReached: "Kun giddugaleessa jireenyaa. Hojiiwwan dabalataa postuuf kaardii kaffaltii qabachuu qabda.",
      upgradeToPostMore: "Hojiiwwan itti fufuuf kaardii keessan guddisaa.",
      upgradePlan: "Kaardii Guddisaa",
      required: "Barbaachisa",
    },
    contactUs: {
      getInTouch: "Nu Qunnamsiisi",
      getInTouchWith: "Nu Qunnamsiisi",
      haveQuestions: "Waa'ee platform keenyaa gaaffilee qabduu? Akkaawuntii keessan keessatti gargaarsa barbaadduu? Hojiiwwan bilisaa keessatti milkaa'inaaf gargaarsa goona.",
      phone: "Bilbila",
      email: "Imeelii",
      office: "Biroo",
      businessHours: "Sa'aatoota Dhaabbataa",
      monFriHours: "Wiixataa-Hamussaa 9AM-6PM EAT",
      respondWithin24Hours: "Sa'aatii 24 keessatti deebina",
      weekendSupportAvailable: "Gargaarsa ibsaa jira",
      sendUsMessage: "Ergaa Nu Ergi",
      fullName: "Maqaa Guutuu",
      emailAddress: "Teessoo Imeelii",
      subject: "Mataa",
      message: "Ergaa",
      selectSubject: "Mataa filadhuu",
      generalInquiry: "Gaaffii Waliigalaa",
      technicalSupport: "Gargaarsa Teknikaa",
      partnership: "Waliigaltee",
      billingPayments: "Kaffaltiinsa & Kaffaltiinsa",
      feedback: "Deebii",
      other: "Kanaa",
      yourFullName: "Maqaa keessan guutuu",
      yourEmailPlaceholder: "your.email@example.com",
      tellUsHowWeCanHelp: "Akka nuti gargaarsa goonu nu himaa...",
      sending: "Ergamuu...",
      sendMessage: "Ergaa Ergi",
      visitOurOffice: "Biroo Keenyaa Taa'aa",
      hustleXHQ: "HustleX HQ",
      officeLocationDescription: "Gidduu ganda dhaabbataa Finfinnee keessatti argamu biroo keenya gidduu hubannoo fi walgahii biyya Itoophiyaa keessatti guddisaa jiru hojiiwwan bilisaa keessatti gidduu gidduu ta'a.",
      openInGoogleMaps: "Google Maps keessatti Bani",
      followUs: "Nu Hordofaa",
      needQuickAnswers: "Deebii Ariifachaa Barbaadduu?",
      checkOutFAQ: "Gaaffilee waliigalaa deebii ariifachaa argachuuf FAQ keessaa keenyaa ilaalaa.",
      visitFAQ: "FAQ Taa'aa",
      validationFailed: "Mirkaneessuu hin milkaane:",
      failedToSendMessage: "Ergaa erguu hin milkaane. Maaloo irra deebi'i.",
      failedToSendMessageCheckConnection: "Ergaa erguu hin milkaane. Maaloo qunnamtii keessan mirkaneessaa fi irra deebi'i.",
    },
    faq: {
      whatIsHustleX: "HustleX maal akka ta'e?",
      whatIsHustleXAnswer: "HustleX platformii bilisummaa Itoophiyaa kan jalqabaa ta'e kan ogummaa guddaa Itoophiyaa waliin daldaltoota addunyaa waliin qunnamsiisu. Baraasa daldaltoonni ogummaa qaban argatanii hojjattoonni bilisaa ogummaa isaanii agarsiisan baraasa amanamaa fi eegumsa qabu kennina.",
      howDoIGetStartedAsFreelancer: "Akka hojjattaa bilisaa akkamitti eegalaa?",
      howDoIGetStartedAsFreelancerAnswer: "Eegumsa salphaadha! Akkaawuntii bilisummaa uumaa, profilee keessan ogummaa fi beekumsa keessan waliin guutaa, odeeffannoo kaffaltii keessan saaxilaa, fi projeektiwwan jiran hordofaa. Projeektiwwan jiran hordofachuu dandeessu. Daldaltoota jireenyaa hojii keessan agarsiisuuf portfolio gammachuu dandeessu.",
      howDoIPostJobAsClient: "Akka daldalaa hojii akkamitti galchisiisaa?",
      howDoIPostJobAsClientAnswer: "Akka daldalaa, akkaawuntii uumaa, 'Hojii Galchisiisuu' qabsiisaa, fi odeeffannoo gadi fagoo projeektiin keessan irratti kennitaniin hojiiwwan galchisiisuu dandeessu. Kun odeeffannoo gadi fagoo barbaachisaa, baajeta, yeroo, fi ogummaa barbaachisan hammata. Platformiin keenya hojjattoota bilisaa qophaa'een waliin walitti makuu.",
      whatAreTheFees: "Kaffaltiinsa HustleX fayyadamuuf maal ta'a?",
      whatAreTheFeesAnswer: "Hojjattoota bilisaaaf, kaffaltiinsa tajaajilaa hin baafnu. Daldaltoonni hojiiwwan bilisummaan galchisiisuu dandeessu. Galmee premium kan faayidaa dabalataa fi kaffaltiinsa gadi aanaa qabanis kennina. (dhufu jira)",
      whatCategoriesAvailable: "Gareewwan hojii maal jira?",
      whatCategoriesAvailableAnswer: "Ogummaa 200 ol kaayyoo gareewwan gurguddoo kan akka Development, Design, Marketing, Writing, Mobile Development, Business Consulting, Translation, fi tajaajiloota adda addaa baay'ee kanaa dhaabbina.",
      howDoICommunicate: "Hojjattaa bilisaa/daldalaa kiyya waliin akkamitti qunnamsiisaa?",
      howDoICommunicateAnswer: "Platformiin keenya qunnamtii eegumsa qabuuf meeshaalee ergaa gidduu gidduu kennina. Hojjattaan bilisaa fi daldalaan meeshaalee ergaa kanaatiin ykn tooraan imeelii waliin qunnamsiisuu dandeessu.",
      whatIfNotSatisfied: "Yoo hojii irratti hin gammaddhu?",
      whatIfNotSatisfiedAnswer: "Himannoo murteessuu kan raawwannoo adda addaa murteessuuf qabna. Yoo hin gammaddhu, fooyya'iiwwan gaafachuu ykn himannoo galchisuu dandeessu. Gareen deeggarsa keenya gidduu ta'aa fi haala haqaa lamaanis gidduu ta'uuf hojjata.",
      canIWorkInternationally: "Daldaltoota addunyaa/hojjattoota bilisaa addunyaa waliin hojjachuu danda'a?",
      canIWorkInternationallyAnswer: "Dhugumatti! HustleX ogummaa Itoophiyaa daldaltoota addunyaa waliin walitti makuu.",
      isCustomerSupportAvailable: "Deeggarsa daldalaa jira?",
      isCustomerSupportAvailableAnswer: "Eeyyee! Deeggarsa daldalaa 24/7 gidduu keenya deeggarsa, haasawa jireenyaa, fi imeelii kennina. Gareen deeggarsa keenya hojjattoota bilisaa fi daldaltoota barbaachisaa beekaa fi raawwannoo adda addaa ariifachisaa ni deeggara.",
      gotQuestions: "Gaaffii Qabduu? Deebii Qabna!",
      gotAnswers: "HustleX fayyadamuu irratti gaaffilee baay'ee baratamaa ta'aniif deebii argadhu. Kan barbaaddu argachuu hin dandeenye? Garee gargaarsaa keenya qunnamsiisi.",
      contactSupportDesc: "Gareen gargaarsaa keenya HustleX irratti akka milkooftu si gargaaruuf as jira.",
      stillHaveQuestions: "Ammas Gaaffii Qabduu?",
      howRatePlatform: "Mootummaa keenya akkamitti madaaltu?",
      howRatePlatformAnswer: "Tajaajila keenyatti ni boonna. Fayyadamtoonni keenya yeroo hunda Itoophiyaa keessatti bakka hojii bilisaa tokkooffaa godhanii nu madaalu.",
      contactSupport: "Deeggarsa Qunnamsiisi",
      visitHelpCenter: "Gidduu Gargaarsaa Ilaali",
    },
  },
};

export const getTranslations = (language: Language): Translations => {
  return translations[language] || translations.en;
};

export default translations;
