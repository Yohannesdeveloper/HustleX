/**
 * HustleX SEO Component
 * Dynamic SEO management using react-helmet-async
 * Optimized for Google, Bing, AI Search, ChatGPT Search, and Voice Search
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import {
  siteConfig,
  openGraph,
  twitterCard,
  structuredData,
  homepageSEO,
  pageSEO,
  voiceSearchOptimization,
  generateKeywordsString,
  generateStructuredDataScript,
} from "../utils/seoConfig";

// SEO Props Interface
interface SEOProps {
  // Basic Meta
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;

  // Robots
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  ogLocale?: string;

  // Twitter Card
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  // Structured Data
  structuredData?: object | object[];

  // Additional Meta
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
  section?: string;
  tags?: string[];

  // Article specific
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO: React.FC<SEOProps> = ({
  // Basic Meta
  title,
  description,
  keywords = [],
  canonical,

  // Robots
  robots,
  noindex = false,
  nofollow = false,

  // Open Graph
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  ogSiteName = siteConfig.name,
  ogLocale = siteConfig.locale,

  // Twitter Card
  twitterCard: twitterCardType = twitterCard.card,
  twitterSite = twitterCard.site,
  twitterCreator = twitterCard.creator,
  twitterTitle,
  twitterDescription,
  twitterImage,

  // Structured Data
  structuredData: customStructuredData,

  // Article specific
  article,
}) => {
  // Construct robots meta
  const robotsMeta = robots || (noindex
    ? (nofollow ? "noindex, nofollow" : "noindex, follow")
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  );

  // Prepare keywords string
  const keywordsString = keywords.length > 0
    ? generateKeywordsString(keywords)
    : undefined;

  // Prepare structured data
  const structuredDataScripts = React.useMemo(() => {
    const scripts: object[] = [];

    if (customStructuredData) {
      if (Array.isArray(customStructuredData)) {
        scripts.push(...customStructuredData);
      } else {
        scripts.push(customStructuredData);
      }
    }

    return scripts;
  }, [customStructuredData]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta name="robots" content={robotsMeta} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Viewport & Theme */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content={siteConfig.themeColor} />

      {/* Author & Copyright */}
      <meta name="author" content={article?.author || siteConfig.name} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteConfig.name}`} />

      {/* Language */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="English" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="ICBM" content="37.7749, -122.4194" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:locale" content={ogLocale} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {ogImage && <meta property="og:image:alt" content={ogTitle || title} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCardType} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      {twitterImage && <meta name="twitter:image:alt" content={twitterTitle || ogTitle || title} />}

      {/* Article Specific (if applicable) */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {article?.tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Mobile App Capable */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Microsoft Tiles */}
      <meta name="msapplication-TileColor" content={siteConfig.themeColor} />
      <meta name="msapplication-TileImage" content={siteConfig.logo} />

      {/* Verification Tags (placeholder - add actual verification codes) */}
      {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
      {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}
      {/* <meta name="facebook-domain-verification" content="YOUR_FB_CODE" /> */}

      {/* Structured Data JSON-LD */}
      {structuredDataScripts.map((data, index) => (
        <script key={index} type="application/ld+json">
          {generateStructuredDataScript(data)}
        </script>
      ))}
    </Helmet>
  );
};

// Pre-configured SEO components for common pages
export const HomeSEO: React.FC = () => {
  return (
    <SEO
      title={homepageSEO.title}
      description={homepageSEO.description}
      keywords={homepageSEO.keywords}
      canonical={homepageSEO.canonical}
      ogTitle={openGraph.homepage.title}
      ogDescription={openGraph.homepage.description}
      ogImage={openGraph.homepage.image}
      ogUrl={openGraph.homepage.url}
      ogType={openGraph.homepage.type}
      twitterTitle={twitterCard.homepage.title}
      twitterDescription={twitterCard.homepage.description}
      twitterImage={twitterCard.homepage.image}
      structuredData={[
        structuredData.organization,
        structuredData.website,
        structuredData.professionalService,
      ]}
    />
  );
};

export const HireSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.hireFreelancer.title}
      description={pageSEO.hireFreelancer.description}
      keywords={pageSEO.hireFreelancer.keywords}
      canonical={pageSEO.hireFreelancer.canonical}
      ogTitle={openGraph.hire.title}
      ogDescription={openGraph.hire.description}
      ogImage={openGraph.hire.image}
      ogUrl={openGraph.hire.url}
      twitterTitle={twitterCard.hire.title}
      twitterDescription={twitterCard.hire.description}
      twitterImage={twitterCard.hire.image}
      structuredData={structuredData.organization}
    />
  );
};

export const BecomeFreelancerSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.becomeFreelancer.title}
      description={pageSEO.becomeFreelancer.description}
      keywords={pageSEO.becomeFreelancer.keywords}
      canonical={pageSEO.becomeFreelancer.canonical}
      ogTitle={openGraph.becomeFreelancer.title}
      ogDescription={openGraph.becomeFreelancer.description}
      ogImage={openGraph.becomeFreelancer.image}
      ogUrl={openGraph.becomeFreelancer.url}
      twitterTitle={twitterCard.becomeFreelancer.title}
      twitterDescription={twitterCard.becomeFreelancer.description}
      twitterImage={twitterCard.becomeFreelancer.image}
      structuredData={structuredData.organization}
    />
  );
};

export const JobListingsSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.jobListings.title}
      description={pageSEO.jobListings.description}
      keywords={pageSEO.jobListings.keywords}
      canonical={pageSEO.jobListings.canonical}
      ogTitle={openGraph.jobs.title}
      ogDescription={openGraph.jobs.description}
      ogImage={openGraph.jobs.image}
      ogUrl={openGraph.jobs.url}
      structuredData={[
        structuredData.organization,
        structuredData.jobPosting,
      ]}
    />
  );
};

export const AboutSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.aboutUs.title}
      description={pageSEO.aboutUs.description}
      keywords={pageSEO.aboutUs.keywords}
      canonical={pageSEO.aboutUs.canonical}
      structuredData={structuredData.organization}
    />
  );
};

export const ContactSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.contactUs.title}
      description={pageSEO.contactUs.description}
      keywords={pageSEO.contactUs.keywords}
      canonical={pageSEO.contactUs.canonical}
      structuredData={structuredData.organization}
    />
  );
};

export const FAQSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.faq.title}
      description={pageSEO.faq.description}
      keywords={pageSEO.faq.keywords}
      canonical={pageSEO.faq.canonical}
      structuredData={structuredData.faqPage(voiceSearchOptimization.voiceOptimizedFAQs)}
    />
  );
};

export const PricingSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.pricing.title}
      description={pageSEO.pricing.description}
      keywords={pageSEO.pricing.keywords}
      canonical={pageSEO.pricing.canonical}
    />
  );
};

export const BlogSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.blog.title}
      description={pageSEO.blog.description}
      keywords={pageSEO.blog.keywords}
      canonical={pageSEO.blog.canonical}
    />
  );
};

export const HowItWorksSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.howItWorks.title}
      description={pageSEO.howItWorks.description}
      keywords={pageSEO.howItWorks.keywords}
      canonical={pageSEO.howItWorks.canonical}
    />
  );
};

export const HelpCenterSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.helpCenter.title}
      description={pageSEO.helpCenter.description}
      keywords={pageSEO.helpCenter.keywords}
      canonical={pageSEO.helpCenter.canonical}
    />
  );
};

export const LoginSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.login.title}
      description={pageSEO.login.description}
      keywords={pageSEO.login.keywords}
      canonical={pageSEO.login.canonical}
      noindex={true}
    />
  );
};

export const RegisterSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.register.title}
      description={pageSEO.register.description}
      keywords={pageSEO.register.keywords}
      canonical={pageSEO.register.canonical}
    />
  );
};

// Dashboard SEO (private pages - noindex)
export const HiringDashboardSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.hiringDashboard.title}
      description={pageSEO.hiringDashboard.description}
      noindex={true}
      nofollow={true}
    />
  );
};

export const FreelancerDashboardSEO: React.FC = () => {
  return (
    <SEO
      title={pageSEO.freelancerDashboard.title}
      description={pageSEO.freelancerDashboard.description}
      noindex={true}
      nofollow={true}
    />
  );
};

export default SEO;
