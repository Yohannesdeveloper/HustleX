const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Blog = require("../models/Blog");
const Skill = require("../models/Skill");
const Category = require("../models/Category");
const Project = require("../models/Project");
const { getCache, setCache } = require("../middleware/cache");

// Static SEO configs for default pages
const staticPageSEO = {
  home: {
    title: "HustleX — Hire Elite Freelancers Worldwide | Premium Marketplace",
    description: "Hire top 1% freelancers in web development, MERN stack, UI/UX design & AI services. Trusted by startups & Fortune 500. Get started in minutes.",
    keywords: ["freelancing platform", "hire freelancers", "freelance marketplace", "hire MERN developer", "remote developers"],
    canonicalUrl: "https://hustlex.com/",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  postJob: {
    title: "Post a Project & Get Proposals in 24h | HustleX",
    description: "Post your project for free. Hire verified freelancers in web development, MERN stack, UI/UX design & AI services. 100% secure payments.",
    keywords: ["post a job", "hire freelancers", "freelance project", "hire developers"],
    canonicalUrl: "https://hustlex.com/post-job",
    ogImage: "https://hustlex.com/og-image-hire.jpg",
  },
  jobListings: {
    title: "Browse Freelance Jobs | Remote Opportunities — HustleX",
    description: "Discover 1000+ freelance jobs in web development, design, marketing & AI. Remote opportunities for elite freelancers worldwide.",
    keywords: ["freelance jobs", "remote work", "MERN jobs", "developer opportunities"],
    canonicalUrl: "https://hustlex.com/job-listings",
    ogImage: "https://hustlex.com/og-image-jobs.jpg",
  },
  about: {
    title: "About Us | HustleX — Premium Freelance Marketplace",
    description: "HustleX connects businesses with the world's top 1% freelancers. Learn about our mission, values, and commitment to excellence.",
    keywords: ["about HustleX", "our mission", "freelance network", "elite freelancers"],
    canonicalUrl: "https://hustlex.com/about-us",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  contact: {
    title: "Contact Us | HustleX Support & Inquiries",
    description: "Get in touch with HustleX. We are here to help with your questions, support needs, and partnership inquiries. 24/7 support available.",
    keywords: ["contact HustleX", "support", "help", "customer service"],
    canonicalUrl: "https://hustlex.com/contact-us",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  faq: {
    title: "FAQ | HustleX — Frequently Asked Questions",
    description: "Find answers to common questions about hiring freelancers, getting paid, account management, and using HustleX.",
    keywords: ["HustleX FAQ", "help center", "freelancer guides", "payment security"],
    canonicalUrl: "https://hustlex.com/faq",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  pricing: {
    title: "Pricing | HustleX — Transparent Freelance Marketplace Fees",
    description: "Simple, transparent pricing for clients and freelancers. No hidden fees. Start for free and scale as you grow.",
    keywords: ["HustleX pricing", "service fee", "freelance commissions", "billing"],
    canonicalUrl: "https://hustlex.com/pricing",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  howItWorks: {
    title: "How It Works | HustleX — Hire or Work in 3 Simple Steps",
    description: "Learn how HustleX works. Post projects, hire elite freelancers, and manage work seamlessly. Or join as a freelancer and start earning.",
    keywords: ["how HustleX works", "how to hire", "getting hired", "escrow payments"],
    canonicalUrl: "https://hustlex.com/HowItWorks",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  },
  helpCenter: {
    title: "Help Center | HustleX — Support & Documentation",
    description: "Comprehensive guides, tutorials, and support resources for clients and freelancers. Get the most out of HustleX.",
    keywords: ["help center", "documentation", "guides", "user tutorials"],
    canonicalUrl: "https://hustlex.com/help-center",
    ogImage: "https://hustlex.com/og-image-home.jpg",
  }
};

// Clean text helper
const cleanText = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").replace(/"/g, "&quot;").replace(/\s+/g, " ").trim();
};

// Injects metadata and pre-rendered body into base index.html
const injectMetadata = (html, meta, bodyHtml = "") => {
  // Strip existing title, description, keywords, canonical, OG, Twitter tags, and structured data
  let cleanHtml = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta name="title"[\s\S]*?>/gi, "")
    .replace(/<meta name="description"[\s\S]*?>/gi, "")
    .replace(/<meta name="keywords"[\s\S]*?>/gi, "")
    .replace(/<link rel="canonical"[\s\S]*?>/gi, "")
    .replace(/<meta property="og:[\s\S]*?>/gi, "")
    .replace(/<meta name="twitter:[\s\S]*?>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  const title = meta.title || "HustleX — Hire Elite Freelancers Worldwide";
  const desc = cleanText(meta.description || "Premium Freelancing Marketplace");
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(", ") : (meta.keywords || "");
  const canonical = meta.canonicalUrl || "https://hustlex.com/";
  const ogImg = meta.ogImage || "https://hustlex.com/og-image-home.jpg";

  // Build the new HEAD tags
  let headTags = `
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${desc}" />
  ${keywords ? `<meta name="keywords" content="${keywords}" />` : ""}
  <link rel="canonical" href="${canonical}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${ogImg}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:site_name" content="HustleX" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@HustleX" />
  <meta name="twitter:creator" content="@HustleX" />
  <meta name="twitter:url" content="${canonical}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${ogImg}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- Dynamic hreflang tags -->
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  `;

  // Inject structured data script if provided
  if (meta.structuredData) {
    const list = Array.isArray(meta.structuredData) ? meta.structuredData : [meta.structuredData];
    list.forEach((data) => {
      headTags += `\n  <script type="application/ld+json">\n  ${JSON.stringify(data, null, 2)}\n  </script>`;
    });
  }

  // Insert headTags at the top of <head>
  cleanHtml = cleanHtml.replace(/<head>/i, `<head>${headTags}`);

  // Inject pre-rendered body snapshot inside <div id="root">
  if (bodyHtml) {
    cleanHtml = cleanHtml.replace(/<div id="root"><\/div>/i, `<div id="root">${bodyHtml}</div>`);
  }

  return cleanHtml;
};

// Generates BreadcrumbList JSON-LD
const makeBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url,
  })),
});

// Server-Side Pre-renderer Middleware
exports.prerenderPage = async (req, res, next) => {
  // If the request points to files or APIs, pass through
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.includes(".")) {
    return next();
  }

  try {
    let templateHtml = "";
    const distPath = path.join(__dirname, "..", "dist", "index.html");
    const rootPath = path.join(__dirname, "..", "..", "index.html");

    // Read Vite HTML template
    if (fs.existsSync(distPath)) {
      templateHtml = fs.readFileSync(distPath, "utf-8");
    } else if (fs.existsSync(rootPath)) {
      templateHtml = fs.readFileSync(rootPath, "utf-8");
    } else {
      return res.status(500).send("index.html template not found");
    }

    let meta = { ...staticPageSEO.home };
    let bodyHtml = "";
    const pathSegments = req.path.split("/").filter(Boolean);

    // ─────────────────────────────────────────────────────────────
    // Route 1: JOB DETAILS (/job-details/:id)
    // ─────────────────────────────────────────────────────────────
    if (req.path.startsWith("/job-details/")) {
      const jobId = pathSegments[1];
      if (mongoose.Types.ObjectId.isValid(jobId)) {
        const job = await Job.findById(jobId).populate("postedBy", "email profile").lean();
        if (job) {
          meta.title = `${job.title} | ${job.company || "HustleX"} | Freelance Jobs`;
          meta.description = cleanText(job.description).substring(0, 150);
          meta.canonicalUrl = `https://hustlex.com/job-details/${job._id}`;
          meta.keywords = job.skills || [];
          
          // JobPosting Structured Data
          const jobPostingSchema = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "datePosted": job.createdAt,
            "validThrough": job.deadline ? new Date(job.deadline).toISOString() : undefined,
            "employmentType": "CONTRACTOR",
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company || "HustleX Client",
              "sameAs": job.companyWebsite || "https://hustlex.com",
            },
            "jobLocationType": "TELECOMMUTE",
            "applicantLocationRequirements": {
              "@type": "Country",
              "name": "Worldwide"
            },
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.budget,
                "unitText": "Project"
              }
            }
          };

          const breadcrumbs = makeBreadcrumbSchema([
            { name: "Home", url: "https://hustlex.com" },
            { name: "Jobs", url: "https://hustlex.com/job-listings" },
            { name: job.title, url: meta.canonicalUrl }
          ]);

          meta.structuredData = [jobPostingSchema, breadcrumbs];

          // Fetch similar jobs for internal linking
          const similarJobs = await Job.find({
            category: job.category,
            _id: { $ne: job._id },
            isActive: true,
            approved: true
          }).limit(5).select("title slug").lean();

          // Render semantic HTML body
          bodyHtml = `
            <div class="seo-snapshot container mx-auto p-6">
              <nav class="breadcrumbs text-sm text-gray-500 mb-4">
                <a href="/">Home</a> &gt; <a href="/job-listings">Jobs</a> &gt; <span>${job.title}</span>
              </nav>
              <article class="job-article">
                <h1 class="text-3xl font-bold mb-4">${job.title}</h1>
                <div class="metadata mb-6 text-gray-600">
                  <p><strong>Company:</strong> ${job.company || "HustleX Client"}</p>
                  <p><strong>Budget:</strong> ${job.budget}</p>
                  <p><strong>Category:</strong> ${job.category}</p>
                </div>
                <div class="description mb-8">
                  <h2 class="text-xl font-semibold mb-2">Job Description</h2>
                  <div>${job.description}</div>
                </div>
                ${job.requirements?.length ? `
                <div class="requirements mb-6">
                  <h3 class="text-lg font-semibold mb-2">Requirements</h3>
                  <ul class="list-disc pl-5">${job.requirements.map(reqItem => `<li>${reqItem}</li>`).join("")}</ul>
                </div>` : ""}
              </article>
              <section class="internal-links mt-12 border-t pt-6">
                <h3 class="text-lg font-semibold mb-3">Similar Freelance Jobs</h3>
                <ul class="space-y-2">
                  ${similarJobs.map(sj => `<li><a href="/job-details/${sj._id}" class="text-sky-600 hover:underline">${sj.title}</a></li>`).join("")}
                </ul>
              </section>
            </div>
          `;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Route 2: FREELANCER PUBLIC PROFILE (/freelancers/:slug)
    // ─────────────────────────────────────────────────────────────
    else if (req.path.startsWith("/freelancers/")) {
      const slug = pathSegments[1];
      const user = await User.findOne({ slug, isActive: { $ne: false } }).lean();

      if (user && user.profile) {
        const name = `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim();
        meta.title = `${name} | Elite ${user.profile.primarySkill || "Freelancer"} | HustleX`;
        meta.description = cleanText(user.profile.bio).substring(0, 150) || `Hire ${name}, a professional freelancer on HustleX.`;
        meta.canonicalUrl = `https://hustlex.com/freelancers/${user.slug}`;
        meta.keywords = user.profile.skills || [];

        // Person Structured Data
        const personSchema = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": name,
          "description": user.profile.bio,
          "jobTitle": user.profile.primarySkill,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": user.profile.location || "Remote"
          },
          "knowsAbout": user.profile.skills,
          "workLocation": {
            "@type": "ContactPoint",
            "contactType": "Remote Work"
          }
        };

        const breadcrumbs = makeBreadcrumbSchema([
          { name: "Home", url: "https://hustlex.com" },
          { name: "Freelancers", url: "https://hustlex.com/freelancers" },
          { name: name, url: meta.canonicalUrl }
        ]);

        meta.structuredData = [personSchema, breadcrumbs];

        // Fetch similar freelancers for internal linking
        const similarFreelancers = await User.find({
          "profile.primarySkill": user.profile.primarySkill,
          slug: { $ne: user.slug },
          roles: { $in: ["freelancer"] },
          isActive: { $ne: false }
        }).limit(5).select("profile slug").lean();

        // Render profile body
        bodyHtml = `
          <div class="seo-snapshot container mx-auto p-6">
            <nav class="breadcrumbs text-sm text-gray-500 mb-4">
              <a href="/">Home</a> &gt; <a href="/freelancers">Freelancers</a> &gt; <span>${name}</span>
            </nav>
            <div class="profile-header flex items-center space-x-6 mb-8">
              <div>
                <h1 class="text-3xl font-bold">${name}</h1>
                <p class="text-xl text-gray-600">${user.profile.primarySkill || "Freelancer"}</p>
                <p class="text-gray-500">${user.profile.location || "Remote"}</p>
              </div>
            </div>
            <div class="bio mb-8">
              <h2 class="text-xl font-semibold mb-2">About Me</h2>
              <p>${user.profile.bio || "No biography available."}</p>
            </div>
            <div class="skills mb-8">
              <h3 class="text-lg font-semibold mb-2">Expertise</h3>
              <div class="flex flex-wrap gap-2">
                ${user.profile.skills?.map(skill => `<span class="bg-gray-100 px-3 py-1 rounded-full text-sm">${skill}</span>`).join("")}
              </div>
            </div>
            <section class="internal-links mt-12 border-t pt-6">
              <h3 class="text-lg font-semibold mb-3">Similar Freelancers</h3>
              <ul class="space-y-2">
                ${similarFreelancers.map(sf => {
                  const sfName = `${sf.profile?.firstName || ""} ${sf.profile?.lastName || ""}`.trim();
                  return `<li><a href="/freelancers/${sf.slug}" class="text-sky-600 hover:underline">${sfName} - ${sf.profile?.primarySkill}</a></li>`;
                }).join("")}
              </ul>
            </section>
          </div>
        `;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Route 3: BLOG POSTS (/blog/:idOrSlug)
    // ─────────────────────────────────────────────────────────────
    else if (req.path.startsWith("/blog/")) {
      const idOrSlug = pathSegments[1];
      let query = { slug: idOrSlug };
      
      // Support lookups by MongoDB ID as fallback
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
      }

      const blog = await Blog.findOne(query).lean();
      if (blog) {
        meta.title = `${blog.title} | HustleX Blog`;
        meta.description = cleanText(blog.content).substring(0, 150);
        meta.canonicalUrl = `https://hustlex.com/blog/${blog.slug || blog._id}`;
        meta.keywords = [blog.category, "freelance blog", "HustleX insights"];

        // Article Structured Data
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": blog.title,
          "image": blog.imageUrl || "https://hustlex.com/og-image-home.jpg",
          "datePublished": blog.createdAt,
          "dateModified": blog.updatedAt,
          "author": {
            "@type": "Person",
            "name": blog.author || "HustleX Editor"
          }
        };

        const breadcrumbs = makeBreadcrumbSchema([
          { name: "Home", url: "https://hustlex.com" },
          { name: "Blog", url: "https://hustlex.com/blog" },
          { name: blog.title, url: meta.canonicalUrl }
        ]);

        meta.structuredData = [articleSchema, breadcrumbs];

        // Fetch related blogs
        const relatedBlogs = await Blog.find({
          category: blog.category,
          _id: { $ne: blog._id },
          isPublished: true
        }).limit(5).select("title slug").lean();

        // Render blog post body
        bodyHtml = `
          <div class="seo-snapshot container mx-auto p-6">
            <nav class="breadcrumbs text-sm text-gray-500 mb-4">
              <a href="/">Home</a> &gt; <a href="/blog">Blog</a> &gt; <span>${blog.title}</span>
            </nav>
            <article class="blog-post">
              <h1 class="text-4xl font-bold mb-4">${blog.title}</h1>
              <div class="blog-meta mb-6 text-gray-500">
                <span>By ${blog.author || "Admin"}</span> | <span>Published on ${new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="max-w-full rounded mb-6"/>` : ""}
              <div class="blog-content leading-relaxed">${blog.content}</div>
            </article>
            <section class="internal-links mt-12 border-t pt-6">
              <h3 class="text-lg font-semibold mb-3">Related Articles</h3>
              <ul class="space-y-2">
                ${relatedBlogs.map(rb => `<li><a href="/blog/${rb.slug || rb._id}" class="text-sky-600 hover:underline">${rb.title}</a></li>`).join("")}
              </ul>
            </section>
          </div>
        `;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Route 4: PROGRAMMATIC LANDING PAGES (/hire-:skill-developers, etc.)
    // ─────────────────────────────────────────────────────────────
    // Supported formats:
    // - /hire-[skill]-developers
    // - /freelancers/[location-or-skill]
    // - /jobs/[job-title]
    // - /skills/[skill]
    else {
      const pathText = pathSegments[0] || "";
      let isProgrammatic = false;
      let pSeoType = "";
      let pSeoSlug = "";

      if (pathText.startsWith("hire-") && pathText.endsWith("-developers")) {
        isProgrammatic = true;
        pSeoType = "hire-developers";
        pSeoSlug = pathText.replace("hire-", "").replace("-developers", "");
      } else if (pathText === "freelancers" && pathSegments[1]) {
        // Exclude direct freelancer username pages by checking if the slug is a known location or skill
        const slugText = pathSegments[1];
        const isSkill = await Skill.findOne({ slug: slugText }).select("_id").lean();
        const isKnownLocation = ["ethiopia", "addis-ababa", "kenya", "nairobi", "nigeria", "lagos"].includes(slugText.toLowerCase());
        
        if (isSkill || isKnownLocation) {
          isProgrammatic = true;
          pSeoType = isSkill ? "freelancers-skill" : "freelancers-location";
          pSeoSlug = slugText;
        }
      } else if (pathText === "jobs" && pathSegments[1]) {
        isProgrammatic = true;
        pSeoType = "jobs-title";
        pSeoSlug = pathSegments[1];
      } else if (pathText === "skills" && pathSegments[1]) {
        isProgrammatic = true;
        pSeoType = "skills-page";
        pSeoSlug = pathSegments[1];
      }

      if (isProgrammatic) {
        // Query database data for programmatic landing pages
        const data = await queryProgrammaticData(pSeoType, pSeoSlug);
        if (data) {
          meta.title = data.metaTitle;
          meta.description = data.metaDescription;
          meta.canonicalUrl = `https://hustlex.com${req.path}`;
          meta.keywords = data.keywords;
          
          // FAQ & Breadcrumbs
          const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          };

          const breadcrumbs = makeBreadcrumbSchema([
            { name: "Home", url: "https://hustlex.com" },
            { name: data.breadcrumbsName, url: meta.canonicalUrl }
          ]);

          meta.structuredData = [faqSchema, breadcrumbs];

          // Render programmatic HTML layout
          bodyHtml = `
            <div class="seo-snapshot container mx-auto p-6">
              <h1 class="text-4xl font-extrabold mb-4">${data.headline}</h1>
              <p class="text-lg text-gray-700 mb-8">${data.introduction}</p>
              
              <section class="stats grid grid-cols-3 gap-6 mb-12">
                <div class="bg-sky-50 p-4 rounded text-center border border-sky-100">
                  <span class="block text-2xl font-bold text-sky-800">${data.stats.count}</span>
                  <span class="text-sm text-gray-600">Available Specialists</span>
                </div>
                <div class="bg-sky-50 p-4 rounded text-center border border-sky-100">
                  <span class="block text-2xl font-bold text-sky-800">${data.stats.avgRate}</span>
                  <span class="text-sm text-gray-600">Average Hourly Rate</span>
                </div>
                <div class="bg-sky-50 p-4 rounded text-center border border-sky-100">
                  <span class="block text-2xl font-bold text-sky-800">24 Hours</span>
                  <span class="text-sm text-gray-600">Average Time to Hire</span>
                </div>
              </section>

              <section class="items-list mb-12">
                <h2 class="text-2xl font-bold mb-4">${data.listHeadline}</h2>
                <div class="space-y-4">
                  ${data.items.map(item => `
                    <div class="border p-4 rounded shadow-sm hover:shadow-md transition">
                      <h3 class="font-bold text-lg"><a href="${item.url}" class="text-sky-600 hover:underline">${item.title}</a></h3>
                      <p class="text-gray-600 mt-1">${item.subtitle}</p>
                      <p class="text-sm mt-2 text-gray-500">${item.snippet}</p>
                    </div>
                  `).join("")}
                </div>
              </section>

              <section class="faqs-section mb-12">
                <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div class="space-y-4">
                  ${data.faqs.map(faq => `
                    <div class="faq-item">
                      <h4 class="font-bold text-gray-800 mb-1">${faq.question}</h4>
                      <p class="text-gray-600">${faq.answer}</p>
                    </div>
                  `).join("")}
                </div>
              </section>

              <section class="internal-links border-t pt-6">
                <h3 class="font-semibold text-lg mb-3">Related Skills & Categories</h3>
                <div class="flex flex-wrap gap-3">
                  ${data.relatedLinks.map(link => `<a href="${link.url}" class="bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded text-sky-700 text-sm font-medium border border-sky-200 transition">${link.name}</a>`).join("")}
                </div>
              </section>
            </div>
          `;
        }
      } else {
        // ─────────────────────────────────────────────────────────────
        // Route 5: STATIC PAGES (Home, About, Pricing, FAQ, etc.)
        // ─────────────────────────────────────────────────────────────
        const pageKey = pathText === "" ? "home" : pathText;
        const pageMap = {
          "home": "home",
          "post-job": "postJob",
          "job-listings": "jobListings",
          "about-us": "about",
          "contact-us": "contact",
          "faq": "faq",
          "pricing": "pricing",
          "HowItWorks": "howItWorks",
          "help-center": "helpCenter",
        };
        
        const mappedKey = pageMap[pageKey];
        if (mappedKey && staticPageSEO[mappedKey]) {
          meta = { ...staticPageSEO[mappedKey] };
        }
      }
    }

    // Inject meta parameters & pre-rendered snapshot into the HTML layout
    const finalHtml = injectMetadata(templateHtml, meta, bodyHtml);
    res.set("Content-Type", "text/html");
    return res.send(finalHtml);
  } catch (error) {
    console.error("SEO Pre-render Middleware Error:", error);
    return next(); // Fallback to raw routing if engine crashes
  }
};

// Generates dynamic XML Sitemap
exports.getSitemap = async (req, res) => {
  try {
    const cachedSitemap = await getCache("seo:sitemap");
    if (cachedSitemap) {
      res.header("Content-Type", "application/xml");
      return res.send(cachedSitemap);
    }

    const domain = "https://hustlex.com";
    
    // Core static routes
    const staticRoutes = [
      "",
      "/job-listings",
      "/about-us",
      "/contact-us",
      "/faq",
      "/pricing",
      "/HowItWorks",
      "/help-center"
    ];

    // Fetch dynamic URLs from DB
    const [jobs, users, blogs, skills, categories, projects] = await Promise.all([
      Job.find({ isActive: true, approved: true }).select("_id updatedAt").lean(),
      User.find({ "profile.isProfileComplete": true, isActive: { $ne: false } }).select("slug updatedAt").lean(),
      Blog.find({ isPublished: true }).select("slug updatedAt").lean(),
      Skill.find().select("slug updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
      Project.find().select("slug updatedAt").lean()
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticRoutes.forEach((route) => {
      xml += `  <url>\n    <loc>${domain}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
    });

    // Dynamic jobs
    jobs.forEach((job) => {
      xml += `  <url>\n    <loc>${domain}/job-details/${job._id}</loc>\n    <lastmod>${new Date(job.updatedAt || Date.now()).toISOString().split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic freelancers
    users.forEach((user) => {
      if (user.slug) {
        xml += `  <url>\n    <loc>${domain}/freelancers/${user.slug}</loc>\n    <lastmod>${new Date(user.updatedAt || Date.now()).toISOString().split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    // Dynamic blogs
    blogs.forEach((blog) => {
      if (blog.slug) {
        xml += `  <url>\n    <loc>${domain}/blog/${blog.slug}</loc>\n    <lastmod>${new Date(blog.updatedAt || Date.now()).toISOString().split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    // Programmatic skills
    skills.forEach((skill) => {
      if (skill.slug) {
        xml += `  <url>\n    <loc>${domain}/skills/${skill.slug}</loc>\n    <loc>${domain}/hire-${skill.slug}-developers</loc>\n    <loc>${domain}/freelancers/${skill.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    // Dynamic categories
    categories.forEach((cat) => {
      if (cat.slug) {
        xml += `  <url>\n    <loc>${domain}/categories/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    // Dynamic projects
    projects.forEach((proj) => {
      if (proj.slug) {
        xml += `  <url>\n    <loc>${domain}/projects/${proj.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      }
    });

    xml += `</urlset>`;

    // Cache sitemap for 24 hours (86400s)
    await setCache("seo:sitemap", xml, 86400);

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    res.status(500).send("Failed to generate sitemap");
  }
};

// Generates Robots.txt
exports.getRobots = async (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /chat
Disallow: /payment-wizard
Disallow: /api/

User-agent: GPTBot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /dashboard/

User-agent: PerplexityBot
Allow: /
Disallow: /dashboard/

User-agent: Google-Extended
Allow: /

Sitemap: https://hustlex.com/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.send(robots);
};

// API Endpoint to fetch programmatic SEO page data
exports.getProgrammaticPageData = async (req, res) => {
  const { type, slug } = req.params;
  try {
    const data = await queryProgrammaticData(type, slug);
    if (!data) {
      return res.status(404).json({ message: "Landing page data not found" });
    }
    res.json(data);
  } catch (error) {
    console.error("Programmatic Data API Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Queries and structures data for programmatic pages
async function queryProgrammaticData(type, slug) {
  const cleanSlug = slug.toLowerCase();
  
  if (type === "hire-developers" || type === "freelancers-skill") {
    // 1. Skill landing page (e.g. react)
    const skill = await Skill.findOne({ slug: cleanSlug }).lean() || { name: slug.toUpperCase() };
    const skillName = skill.name;

    // Fetch freelancers with this skill
    const freelancers = await User.find({
      $or: [
        { "profile.primarySkill": new RegExp(`^${skillName}$`, "i") },
        { "profile.skills": new RegExp(`^${skillName}$`, "i") }
      ],
      isActive: { $ne: false }
    }).limit(6).select("profile slug").lean();

    if (freelancers.length === 0) return null; // No freelancers found for this keyword cluster

    const avgHourlyRate = "ETB 500 - 1,500/hr";
    const mappedItems = freelancers.map(f => {
      const name = `${f.profile?.firstName || ""} ${f.profile?.lastName || ""}`.trim();
      return {
        title: name,
        subtitle: f.profile?.primarySkill || `${skillName} Expert`,
        snippet: f.profile?.bio ? f.profile.bio.substring(0, 120) + "..." : `Vetted freelance ${skillName} specialist available for hiring.`,
        url: `/freelancers/${f.slug}`
      };
    });

    return {
      metaTitle: `Hire Best ${skillName} Developers | Vetted Remote Talent - HustleX`,
      metaDescription: `Looking to hire ${skillName} developers? Connect with the top 1% remote ${skillName} specialists in 24 hours. Verified portfolios, competitive rates.`,
      keywords: [skillName, `hire ${skillName.toLowerCase()} developer`, `${skillName.toLowerCase()} freelancers`, `remote ${skillName.toLowerCase()} developers`],
      headline: `Hire Vetted ${skillName} Developers`,
      introduction: `Access our network of verified global ${skillName} developers. Post your project specifications and receive custom proposals in less than 24 hours.`,
      stats: {
        count: freelancers.length * 3 + 12, // simulated dynamic active pool
        avgRate: avgHourlyRate
      },
      listHeadline: `Top Rated ${skillName} Freelancers`,
      items: mappedItems,
      faqs: [
        {
          question: `How do I hire a remote ${skillName} developer on HustleX?`,
          answer: `Hiring a ${skillName} developer is simple: sign up as a client, post your project specifications with details of the technical stack, review quotes and profiles of verified freelancers, interview selected candidates, and secure work using our escrow service.`
        },
        {
          question: `What is the average cost to hire a ${skillName} developer?`,
          answer: `Hourly rates vary depending on experience. Top-tier specialists charge between ${avgHourlyRate}, while fixed-price project quotes depend directly on development timelines and requirements.`
        },
        {
          question: `How does HustleX verify the skills of ${skillName} developers?`,
          answer: `We perform code audits, verify past client ratings, review portfolios, and evaluate project case studies before approving freelancers to represent our network.`
        }
      ],
      breadcrumbsName: `Hire ${skillName} Developers`,
      relatedLinks: [
        { name: "Hire Node.js Developers", url: "/hire-nodejs-developers" },
        { name: "Hire React Developers", url: "/hire-react-developers" },
        { name: "Hire MERN stack Developers", url: "/hire-mern-developers" },
        { name: "Freelancers in Addis Ababa", url: "/freelancers/addis-ababa" },
        { name: "Freelancers in Ethiopia", url: "/freelancers/ethiopia" }
      ]
    };
  } 
  
  else if (type === "freelancers-location") {
    // 2. Location landing page (e.g. ethiopia, addis-ababa)
    const formattedLocation = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    // Fetch freelancers in location
    const freelancers = await User.find({
      "profile.location": new RegExp(formattedLocation, "i"),
      isActive: { $ne: false }
    }).limit(6).select("profile slug").lean();

    if (freelancers.length === 0) return null;

    const mappedItems = freelancers.map(f => {
      const name = `${f.profile?.firstName || ""} ${f.profile?.lastName || ""}`.trim();
      return {
        title: name,
        subtitle: f.profile?.primarySkill || "Freelancer",
        snippet: f.profile?.bio ? f.profile.bio.substring(0, 120) + "..." : `Top rated freelancer based in ${formattedLocation} available for remote work.`,
        url: `/freelancers/${f.slug}`
      };
    });

    return {
      metaTitle: `Hire Best Freelancers in ${formattedLocation} | Top Remote Talent - HustleX`,
      metaDescription: `Connect with vetted remote freelancers in ${formattedLocation}. Find experts in web development, design, and marketing. Fast hiring, secure escrow.`,
      keywords: [`freelancers in ${cleanSlug}`, `hire developers ${cleanSlug}`, `remote work ${cleanSlug}`],
      headline: `Top Rated Freelancers in ${formattedLocation}`,
      introduction: `Hire local and remote specialists in ${formattedLocation} on HustleX. Review qualifications, chat live, and contract top talent for your business.`,
      stats: {
        count: freelancers.length * 4 + 25,
        avgRate: "ETB 400 - 1,200/hr"
      },
      listHeadline: `Available Specialists in ${formattedLocation}`,
      items: mappedItems,
      faqs: [
        {
          question: `Can I hire remote freelancers in ${formattedLocation}?`,
          answer: `Yes, all freelancers listed on HustleX in ${formattedLocation} are available for remote, contract, and hybrid job opportunities worldwide.`
        },
        {
          question: `How are payments handled on HustleX for regional freelancers?`,
          answer: `HustleX manages local payments securely through integrated mobile banking transfers, credit cards, and secure escrow contracts.`
        }
      ],
      breadcrumbsName: `Freelancers in ${formattedLocation}`,
      relatedLinks: [
        { name: "Freelancers in Addis Ababa", url: "/freelancers/addis-ababa" },
        { name: "Freelancers in Ethiopia", url: "/freelancers/ethiopia" },
        { name: "Hire MERN stack Developers", url: "/hire-mern-developers" }
      ]
    };
  }
  
  else if (type === "jobs-title") {
    // 3. Job title search page (e.g. react-developer)
    const titleQuery = slug.split("-").join(" ");
    
    // Fetch jobs by title query
    const jobs = await Job.find({
      title: new RegExp(titleQuery, "i"),
      isActive: true,
      approved: true
    }).limit(6).select("title budget description postedBy").lean();

    if (jobs.length === 0) return null;

    const mappedItems = jobs.map(j => ({
      title: j.title,
      subtitle: `Budget: ${j.budget}`,
      snippet: j.description ? j.description.replace(/<[^>]*>/g, "").substring(0, 120) + "..." : "Remote freelance position.",
      url: `/job-details/${j._id}`
    }));

    return {
      metaTitle: `Remote ${titleQuery.toUpperCase()} Freelance Jobs | Apply on HustleX`,
      metaDescription: `Find and apply to remote ${titleQuery} jobs. Freelance, contract, and full-time opportunities. Top budgets, instant payouts, daily listings.`,
      keywords: [`${cleanSlug} jobs`, `remote ${cleanSlug} gigs`, `apply ${cleanSlug} freelance`],
      headline: `Remote ${titleQuery} Jobs`,
      introduction: `Browse verified freelance and contract positions for ${titleQuery} specialists. Set up an account and apply with your custom proposal.`,
      stats: {
        count: jobs.length + 8,
        avgRate: "USD 25 - 60/hr"
      },
      listHeadline: `Latest Open ${titleQuery} Gigs`,
      items: mappedItems,
      faqs: [
        {
          question: `How do I apply for a ${titleQuery} gig on HustleX?`,
          answer: `Create a freelancer account, build out a portfolio profile showcasing similar work, review the requirements of open positions, and apply by submitting a detailed proposal explaining how you will complete the job.`
        }
      ],
      breadcrumbsName: `${titleQuery} Jobs`,
      relatedLinks: [
        { name: "Browse React Gigs", url: "/jobs/react-developer" },
        { name: "Browse Node.js Gigs", url: "/jobs/nodejs-developer" },
        { name: "Browse MERN stack Gigs", url: "/jobs/mern-developer" }
      ]
    };
  }
  
  else if (type === "skills-page") {
    // 4. Skill details page
    const skill = await Skill.findOne({ slug: cleanSlug }).lean() || { name: slug.toUpperCase(), description: "" };
    const skillName = skill.name;

    // Fetch related jobs and freelancers
    const [jobs, freelancers] = await Promise.all([
      Job.find({ skills: new RegExp(`^${skillName}$`, "i"), isActive: true, approved: true }).limit(3).select("title").lean(),
      User.find({ "profile.skills": new RegExp(`^${skillName}$`, "i"), isActive: { $ne: false } }).limit(3).select("profile slug").lean()
    ]);

    const mappedItems = [];
    freelancers.forEach(f => {
      const name = `${f.profile?.firstName || ""} ${f.profile?.lastName || ""}`.trim();
      mappedItems.push({
        title: `${name} (Freelancer)`,
        subtitle: f.profile?.primarySkill || `${skillName} Specialist`,
        snippet: f.profile?.bio ? f.profile.bio.substring(0, 100) + "..." : "Available for remote work.",
        url: `/freelancers/${f.slug}`
      });
    });

    jobs.forEach(j => {
      mappedItems.push({
        title: `${j.title} (Open Job)`,
        subtitle: "Freelance Position",
        snippet: `Remote gig requiring validated expertise in ${skillName}.`,
        url: `/job-details/${j._id}`
      });
    });

    return {
      metaTitle: `Learn about ${skillName} | Hire Experts & Find Gigs - HustleX`,
      metaDescription: `Discover professional resources for ${skillName}. Hire certified ${skillName} experts, browse active jobs, and review rates on HustleX.`,
      keywords: [skillName, `what is ${cleanSlug}`, `${cleanSlug} developers`, `${cleanSlug} projects`],
      headline: `The Ultimate ${skillName} Resource Hub`,
      introduction: `Explore ${skillName} resources, browse active projects requiring this expertise, and connect with top-rated remote freelancers specializing in this domain.`,
      stats: {
        count: freelancers.length + jobs.length,
        avgRate: "ETB 600/hr avg"
      },
      listHeadline: `Related Freelancers and Open Gigs`,
      items: mappedItems,
      faqs: [
        {
          question: `Why hire a ${skillName} expert?`,
          answer: `Hiring a dedicated ${skillName} expert ensures that your software builds, integrations, or workflows follow modern industry best practices, accelerating project delivery and performance.`
        }
      ],
      breadcrumbsName: `${skillName} Skill Hub`,
      relatedLinks: [
        { name: "Hire React Experts", url: "/hire-react-developers" },
        { name: "React Developer Jobs", url: "/jobs/react-developer" }
      ]
    };
  }

  return null;
}
