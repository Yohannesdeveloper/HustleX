/**
 * HustleX - Complete SEO Configuration
 * Premium Freelancing Marketplace SEO Settings
 * Optimized for Google, Bing, AI Search, ChatGPT Search, and Voice Search
 */

export const siteConfig = {
  name: "HustleX",
  tagline: "Hire Elite Freelancers Worldwide",
  url: "https://hustlex.com",
  logo: "https://hustlex.com/Logo.png",
  favicon: "/Logo.png",
  locale: "en_US",
  twitterHandle: "@HustleX",
  facebookAppId: "",
  themeColor: "#0ea5e9",
};

// ============================================
// 1. HOMEPAGE SEO
// ============================================
export const homepageSEO = {
  // Title: Under 60 characters, click-magnet, premium positioning
  title: "HustleX — Hire Elite Freelancers Worldwide | Premium Marketplace",
  
  // Meta Description: Under 155 characters, luxury, high-trust, conversion focused
  description: "Hire top 1% freelancers in web development, MERN stack, UI/UX design & AI services. Trusted by startups & Fortune 500. Get started in minutes.",
  
  // Keywords: 30 high-ranking keywords
  keywords: [
    "freelancing platform",
    "hire freelancers",
    "freelance marketplace",
    "hire MERN developer",
    "hire web developer",
    "hire UI UX designer",
    "hire graphic designer",
    "hire video editor",
    "hire digital marketer",
    "hire AI developer",
    "Upwork alternative",
    "Fiverr alternative",
    "Toptal alternative",
    "premium freelancers",
    "elite freelancers",
    "remote developers",
    "freelance developers",
    "hire remote team",
    "best freelancing website",
    "top freelance platform",
    "hire Python developer",
    "hire React developer",
    "hire Node.js developer",
    "hire full stack developer",
    "hire mobile app developer",
    "hire SEO expert",
    "hire content writer",
    "hire virtual assistant",
    "hire blockchain developer",
    "hire data scientist",
  ],
  
  // Canonical URL
  canonical: "https://hustlex.com/",
  
  // Robots
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
};

// ============================================
// 2. OPEN GRAPH SETTINGS (Social Media)
// ============================================
export const openGraph = {
  homepage: {
    title: "HustleX — Hire Elite Freelancers Worldwide",
    description: "Connect with top 1% freelancers in web development, MERN stack, UI/UX design & AI services. The premium marketplace for businesses that demand excellence.",
    image: "https://hustlex.com/og-image-home.jpg",
    url: "https://hustlex.com/",
    type: "website",
    siteName: "HustleX",
    locale: "en_US",
  },
  hire: {
    title: "Hire Elite Freelancers | HustleX",
    description: "Post your project and hire top-tier freelancers in 24 hours. Access verified talent in development, design, marketing & AI.",
    image: "https://hustlex.com/og-image-hire.jpg",
    url: "https://hustlex.com/post-job",
    type: "website",
  },
  becomeFreelancer: {
    title: "Become a Freelancer | HustleX",
    description: "Join the elite network. Get high-paying clients, work on exciting projects, and grow your freelance career with HustleX.",
    image: "https://hustlex.com/og-image-freelancer.jpg",
    url: "https://hustlex.com/signup",
    type: "website",
  },
  jobs: {
    title: "Browse Freelance Jobs | HustleX",
    description: "Discover high-quality freelance opportunities. Remote jobs for developers, designers, marketers & AI specialists.",
    image: "https://hustlex.com/og-image-jobs.jpg",
    url: "https://hustlex.com/job-listings",
    type: "website",
  },
};

// ============================================
// 3. TWITTER CARD SETTINGS
// ============================================
export const twitterCard = {
  card: "summary_large_image",
  site: "@HustleX",
  creator: "@HustleX",
  homepage: {
    title: "HustleX — Hire Elite Freelancers Worldwide",
    description: "Connect with top 1% freelancers in web development, MERN stack, UI/UX design & AI services. The premium marketplace for excellence.",
    image: "https://hustlex.com/twitter-image-home.jpg",
  },
  hire: {
    title: "Hire Elite Freelancers | HustleX",
    description: "Post your project and hire top-tier freelancers in 24 hours. Access verified talent in development, design & AI.",
    image: "https://hustlex.com/twitter-image-hire.jpg",
  },
  becomeFreelancer: {
    title: "Become a Freelancer | HustleX",
    description: "Join the elite network. Get high-paying clients and grow your freelance career with HustleX.",
    image: "https://hustlex.com/twitter-image-freelancer.jpg",
  },
};

// ============================================
// 4. STRUCTURED DATA (JSON-LD)
// ============================================
export const structuredData = {
  // Organization Schema
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HustleX",
    alternateName: "HustleX Freelance Marketplace",
    url: "https://hustlex.com",
    logo: "https://hustlex.com/Logo.png",
    sameAs: [
      "https://twitter.com/HustleX",
      "https://www.linkedin.com/company/hustlex",
      "https://www.facebook.com/HustleX",
      "https://www.instagram.com/hustlex",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-HUSTLEX",
      contactType: "customer service",
      availableLanguage: ["English"],
      areaServed: "Worldwide",
    },
    description: "HustleX is a premium global freelancing marketplace connecting businesses with elite freelancers in web development, MERN stack, UI/UX design, graphic design, video editing, digital marketing, and AI services.",
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: "HustleX Team",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
  },

  // Website Schema with Search Action
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HustleX",
    url: "https://hustlex.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://hustlex.com/job-listings?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    description: "Find and hire elite freelancers worldwide. Premium marketplace for web development, design, marketing & AI services.",
    inLanguage: "en-US",
  },

  // Professional Service Schema
  professionalService: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "HustleX Freelance Services",
    image: "https://hustlex.com/Logo.png",
    url: "https://hustlex.com",
    telephone: "+1-800-HUSTLEX",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "37.7749",
      longitude: "-122.4194",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "12500",
      bestRating: "5",
    },
  },

  // JobPosting Schema (for job listings page)
  jobPosting: {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Freelance Opportunities",
    description: "Find high-quality freelance jobs in web development, design, marketing, and AI.",
    hiringOrganization: {
      "@type": "Organization",
      name: "HustleX",
      sameAs: "https://hustlex.com",
    },
    employmentType: "CONTRACTOR",
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
  },

  // BreadcrumbList Schema
  breadcrumbList: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // FAQPage Schema
  faqPage: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }),
};

// ============================================
// 5. PAGE-LEVEL SEO CONFIGURATIONS
// ============================================
export const pageSEO = {
  // Homepage
  home: {
    title: "HustleX — Hire Elite Freelancers Worldwide | Premium Marketplace",
    description: "Hire top 1% freelancers in web development, MERN stack, UI/UX design & AI services. Trusted by startups & Fortune 500. Get started in minutes.",
    keywords: homepageSEO.keywords,
    canonical: "https://hustlex.com/",
  },

  // Hire Freelancer Page (/post-job)
  hireFreelancer: {
    title: "Hire Freelancers | Post a Project & Get Proposals in 24h — HustleX",
    description: "Post your project for free. Hire verified freelancers in web development, MERN stack, UI/UX design, video editing & AI. 100% secure payments.",
    keywords: [
      "hire freelancers",
      "post a project",
      "hire developers",
      "hire designers",
      "freelance hiring",
      "remote hiring",
      "hire talent",
      "find freelancers",
      "project posting",
      "hire web developer",
      "hire app developer",
      "hire software engineer",
    ],
    canonical: "https://hustlex.com/post-job",
  },

  // Become Freelancer Page (/signup with freelancer intent)
  becomeFreelancer: {
    title: "Become a Freelancer | Join Elite Talent Network — HustleX",
    description: "Join HustleX and access high-paying clients worldwide. Work on premium projects in development, design, marketing & AI. Start earning today.",
    keywords: [
      "become a freelancer",
      "freelance jobs",
      "freelance work",
      "remote work",
      "work from home",
      "freelance opportunities",
      "find freelance clients",
      "freelancer registration",
      "join freelance platform",
      "start freelancing",
    ],
    canonical: "https://hustlex.com/signup",
  },

  // Login Page
  login: {
    title: "Sign In | HustleX — Access Your Account",
    description: "Sign in to HustleX to manage your projects, connect with freelancers, or find new opportunities. Secure & fast access.",
    keywords: [
      "HustleX login",
      "sign in",
      "freelancer login",
      "client login",
      "account access",
    ],
    canonical: "https://hustlex.com/login",
    robots: "noindex, follow", // Don't index login page
  },

  // Register Page
  register: {
    title: "Create Account | Join HustleX — Hire or Work",
    description: "Create your free HustleX account. Join as a client to hire elite freelancers or as a freelancer to find premium opportunities.",
    keywords: [
      "HustleX signup",
      "create account",
      "register",
      "join HustleX",
      "freelancer signup",
      "client signup",
    ],
    canonical: "https://hustlex.com/signup",
  },

  // Job Listings Page
  jobListings: {
    title: "Browse Freelance Jobs | Remote Opportunities — HustleX",
    description: "Discover 1000+ freelance jobs in web development, design, marketing & AI. Remote opportunities for elite freelancers worldwide.",
    keywords: [
      "freelance jobs",
      "remote jobs",
      "work from home jobs",
      "developer jobs",
      "designer jobs",
      "marketing jobs",
      "AI jobs",
      "freelance opportunities",
      "contract jobs",
      "gig economy jobs",
    ],
    canonical: "https://hustlex.com/job-listings",
  },

  // About Us Page
  aboutUs: {
    title: "About Us | HustleX — Premium Freelance Marketplace",
    description: "HustleX connects businesses with the world's top 1% freelancers. Learn about our mission, values, and commitment to excellence.",
    keywords: [
      "about HustleX",
      "freelance marketplace",
      "our mission",
      "company values",
      "about us",
    ],
    canonical: "https://hustlex.com/about-us",
  },

  // Contact Us Page
  contactUs: {
    title: "Contact Us | HustleX Support & Inquiries",
    description: "Get in touch with HustleX. We're here to help with your questions, support needs, and partnership inquiries. 24/7 support available.",
    keywords: [
      "contact HustleX",
      "support",
      "help center",
      "customer service",
      "contact us",
    ],
    canonical: "https://hustlex.com/contact-us",
  },

  // FAQ Page
  faq: {
    title: "FAQ | HustleX — Frequently Asked Questions",
    description: "Find answers to common questions about hiring freelancers, getting paid, account management, and using HustleX.",
    keywords: [
      "HustleX FAQ",
      "frequently asked questions",
      "help",
      "how to hire",
      "how to get paid",
      "support",
    ],
    canonical: "https://hustlex.com/faq",
  },

  // Pricing Page
  pricing: {
    title: "Pricing | HustleX — Transparent Freelance Marketplace Fees",
    description: "Simple, transparent pricing for clients and freelancers. No hidden fees. Start for free and scale as you grow.",
    keywords: [
      "HustleX pricing",
      "freelance platform fees",
      "commission rates",
      "pricing plans",
      "subscription",
    ],
    canonical: "https://hustlex.com/pricing",
  },

  // Blog Page
  blog: {
    title: "Blog | HustleX — Insights for Freelancers & Businesses",
    description: "Expert tips, industry insights, and success stories for freelancers and businesses. Level up your freelance career or hiring strategy.",
    keywords: [
      "freelance blog",
      "hiring tips",
      "freelance tips",
      "remote work",
      "business growth",
    ],
    canonical: "https://hustlex.com/blog",
  },

  // How It Works Page
  howItWorks: {
    title: "How It Works | HustleX — Hire or Work in 3 Simple Steps",
    description: "Learn how HustleX works. Post projects, hire elite freelancers, and manage work seamlessly. Or join as a freelancer and start earning.",
    keywords: [
      "how HustleX works",
      "how to hire freelancers",
      "how to find work",
      "getting started",
      "platform guide",
    ],
    canonical: "https://hustlex.com/HowItWorks",
  },

  // Help Center Page
  helpCenter: {
    title: "Help Center | HustleX — Support & Documentation",
    description: "Comprehensive guides, tutorials, and support resources for clients and freelancers. Get the most out of HustleX.",
    keywords: [
      "HustleX help",
      "support center",
      "documentation",
      "guides",
      "tutorials",
    ],
    canonical: "https://hustlex.com/help-center",
  },

  // Dashboard Pages
  hiringDashboard: {
    title: "Hiring Dashboard | Manage Your Projects — HustleX",
    description: "Manage your projects, review proposals, and communicate with freelancers. Your central hub for hiring on HustleX.",
    keywords: ["hiring dashboard", "project management", "client dashboard"],
    canonical: "https://hustlex.com/dashboard/hiring",
    robots: "noindex, nofollow", // Private page
  },

  freelancerDashboard: {
    title: "Freelancer Dashboard | Manage Your Work — HustleX",
    description: "View job opportunities, submit proposals, track earnings, and manage your freelance business on HustleX.",
    keywords: ["freelancer dashboard", "my jobs", "earnings", "proposals"],
    canonical: "https://hustlex.com/dashboard/freelancer",
    robots: "noindex, nofollow", // Private page
  },
};

// ============================================
// 6. VOICE SEARCH OPTIMIZATION
// ============================================
export const voiceSearchOptimization = {
  // Natural language phrases for voice search
  phrases: [
    "how to hire a freelancer on HustleX",
    "best platform to hire developers",
    "where to find elite freelancers",
    "how much does HustleX cost",
    "is HustleX better than Upwork",
    "how to become a freelancer on HustleX",
    "hire MERN stack developer",
    "find remote web developers",
    "best freelance marketplace 2024",
    "hire UI UX designer online",
  ],
  
  // FAQ content optimized for voice search
  voiceOptimizedFAQs: [
    {
      question: "What is HustleX?",
      answer: "HustleX is a premium global freelancing marketplace that connects businesses with elite freelancers specializing in web development, MERN stack, UI/UX design, graphic design, video editing, digital marketing, and AI services.",
    },
    {
      question: "How do I hire a freelancer on HustleX?",
      answer: "To hire a freelancer on HustleX, simply post your project with detailed requirements, review proposals from verified freelancers, interview your top candidates, and hire the best fit. You only pay when work is delivered and approved.",
    },
    {
      question: "Is HustleX free to use?",
      answer: "Yes, HustleX is free to join. Clients can post projects for free, and freelancers can create profiles and apply to jobs at no cost. We charge a small service fee only when a project is completed successfully.",
    },
    {
      question: "What makes HustleX different from Upwork and Fiverr?",
      answer: "HustleX focuses on quality over quantity. We vet our freelancers to ensure only top-tier talent joins the platform. Our clients enjoy faster hiring, better communication, and premium support that other platforms don't provide.",
    },
    {
      question: "How do I become a freelancer on HustleX?",
      answer: "To become a freelancer on HustleX, create a free account, complete your profile with portfolio samples, pass our verification process, and start applying to high-quality projects from global clients.",
    },
  ],
};

// ============================================
// 7. AI SEARCH OPTIMIZATION
// ============================================
export const aiSearchOptimization = {
  // Entity definitions for AI understanding
  entities: {
    brand: "HustleX",
    category: "Freelance Marketplace",
    services: [
      "Web Development",
      "MERN Stack Development",
      "UI/UX Design",
      "Graphic Design",
      "Video Editing",
      "Digital Marketing",
      "AI Services",
    ],
    targetAudience: [
      "Startups",
      "Small Businesses",
      "Enterprise Companies",
      "Entrepreneurs",
      "Marketing Agencies",
      "Tech Companies",
    ],
    valueProposition: "Connect businesses with elite freelancers in 24 hours",
    differentiators: [
      "Vetted elite talent only",
      "Premium quality assurance",
      "Fast hiring process",
      "Secure payments",
      "24/7 dedicated support",
    ],
  },
  
  // Contextual content for AI understanding
  contextualData: {
    industry: "Freelance Marketplace / Gig Economy",
    founded: "2024",
    headquarters: "Global / Remote-First",
    businessModel: "B2B and B2C marketplace",
    competitors: ["Upwork", "Fiverr", "Toptal", "Freelancer.com"],
    uniqueSellingPoints: [
      "Top 1% freelancer vetting",
      "Premium client experience",
      "AI-powered matching",
      "Transparent pricing",
      "Global talent pool",
    ],
  },
};

// ============================================
// 8. TECHNICAL SEO SETTINGS
// ============================================
export const technicalSEO = {
  // Robots meta tags by page type
  robots: {
    public: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    private: "noindex, nofollow",
    auth: "noindex, follow",
    search: "noindex, follow",
  },
  
  // Viewport settings
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
  
  // Theme colors
  themeColor: {
    light: "#ffffff",
    dark: "#0f172a",
  },
  
  // Language and locale
  language: "en",
  locale: "en_US",
  
  // Geo targeting
  geoRegion: "US",
  geoPlacename: "United States",
  geoPosition: "37.7749;-122.4194",
  ICBM: "37.7749, -122.4194",
};

// ============================================
// 9. BRAND POSITIONING KEYWORDS
// ============================================
export const brandPositioning = {
  // Premium positioning
  premium: [
    "elite freelancers",
    "premium marketplace",
    "top-tier talent",
    "exclusive network",
    "high-end freelancers",
    "luxury service",
    "white-glove support",
  ],
  
  // Luxury positioning
  luxury: [
    "concierge service",
    "bespoke matching",
    "curated talent",
    "executive level",
    "enterprise grade",
    "VIP experience",
  ],
  
  // Trust positioning
  trusted: [
    "verified freelancers",
    "secure payments",
    "money-back guarantee",
    "trusted by Fortune 500",
    "rated 4.9 stars",
    "10,000+ successful projects",
  ],
  
  // Modern positioning
  modern: [
    "AI-powered matching",
    "next-gen platform",
    "cutting-edge technology",
    "seamless experience",
    "modern interface",
    "real-time collaboration",
  ],
  
  // Fast positioning
  fast: [
    "hire in 24 hours",
    "instant matching",
    "quick onboarding",
    "fast proposals",
    "rapid deployment",
    "same-day hiring",
  ],
  
  // Global positioning
  global: [
    "worldwide talent",
    "global marketplace",
    "international freelancers",
    "remote workforce",
    "borderless hiring",
    "24/7 availability",
  ],
};

// ============================================
// 10. EXPORT HELPERS
// ============================================
export const getPageSEO = (pageName: keyof typeof pageSEO) => {
  return pageSEO[pageName] || pageSEO.home;
};

export const generateKeywordsString = (keywords: string[]) => {
  return keywords.join(", ");
};

export const generateStructuredDataScript = (data: object) => {
  return JSON.stringify(data, null, 2);
};

export default {
  siteConfig,
  homepageSEO,
  openGraph,
  twitterCard,
  structuredData,
  pageSEO,
  voiceSearchOptimization,
  aiSearchOptimization,
  technicalSEO,
  brandPositioning,
  getPageSEO,
  generateKeywordsString,
  generateStructuredDataScript,
};
