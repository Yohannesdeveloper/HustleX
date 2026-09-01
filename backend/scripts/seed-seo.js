const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const User = require("../models/User");
const Job = require("../models/Job");
const Blog = require("../models/Blog");
const Skill = require("../models/Skill");
const Category = require("../models/Category");
const Project = require("../models/Project");

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    print("🧹 Clearing existing collections...");
    await Category.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Job.deleteMany({});
    await Blog.deleteMany({});
    await User.deleteMany({});
    print("✅ Collections cleared.");

    // Helper for prints that avoids emoji
    function print(msg) {
      console.log(msg);
    }

    // 1. Seed Categories using .save()
    print("🌱 Seeding Categories...");
    const categoriesData = [
      {
        name: "Web & App Development",
        description: "Build next-generation websites, mobile apps, and SaaS applications with elite developers.",
        seo: {
          keywords: ["web development", "app developers", "MERN stack", "software development"],
        }
      },
      {
        name: "Design & Graphics",
        description: "Get custom user interfaces, brand identities, and stunning designs from top visual artists.",
        seo: {
          keywords: ["UI/UX design", "Figma", "graphic design", "branding"],
        }
      },
      {
        name: "Writing & Translation",
        description: "High-quality content writing, copy editing, translation, and localized copy for your brand.",
        seo: {
          keywords: ["content writing", "SEO copywriting", "translation", "editing"],
        }
      }
    ];

    const seededCategories = [];
    for (const cat of categoriesData) {
      const doc = new Category(cat);
      await doc.save();
      seededCategories.push(doc);
    }
    print(`✅ Seeded ${seededCategories.length} categories.`);

    // 2. Seed Skills using .save()
    print("🌱 Seeding Skills...");
    const skillsData = [
      {
        name: "React",
        description: "Build highly interactive frontend user interfaces with React, including Hooks, Context API, Redux, and Next.js.",
        seo: {
          keywords: ["React.js", "frontend developer", "React components", "Single Page Apps"],
        }
      },
      {
        name: "Node.js",
        description: "Scalable backend systems, REST APIs, and microservices powered by Node.js and Express.",
        seo: {
          keywords: ["NodeJS", "Express backend", "REST API", "backend developer"],
        }
      },
      {
        name: "UI/UX Design",
        description: "Create premium user flows, wireframes, and high-fidelity interface designs in Figma.",
        seo: {
          keywords: ["Figma design", "user interface", "user experience", "product designer"],
        }
      }
    ];

    const seededSkills = [];
    for (const sk of skillsData) {
      const doc = new Skill(sk);
      await doc.save();
      seededSkills.push(doc);
    }
    print(`✅ Seeded ${seededSkills.length} skills.`);

    // 3. Seed Users (Freelancers & Clients)
    print("🌱 Seeding Users...");
    
    // Freelancer 1
    const freelancer1 = new User({
      email: "yonas@hustlex.com",
      password: "password123",
      roles: ["freelancer"],
      currentRole: "freelancer",
      profile: {
        firstName: "Yonas",
        lastName: "Alemu",
        phone: "+251911111111",
        location: "Addis Ababa, Ethiopia",
        bio: "Senior Full-Stack MERN developer with 6+ years of experience building scalable web apps. Expert in React, Redux, Node.js, and MongoDB.",
        skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
        primarySkill: "React",
        experienceLevel: "Senior",
        yearsOfExperience: "6",
        availability: "Available",
        monthlyRate: "45000",
        currency: "ETB",
        preferredJobTypes: ["Full-time", "Contract"],
        workLocation: "Remote",
        githubUrl: "https://github.com/yonasalemu",
        linkedinUrl: "https://linkedin.com/in/yonasalemu",
        isProfileComplete: true,
      }
    });

    // Freelancer 2
    const freelancer2 = new User({
      email: "tsion@hustlex.com",
      password: "password123",
      roles: ["freelancer"],
      currentRole: "freelancer",
      profile: {
        firstName: "Tsion",
        lastName: "Girma",
        phone: "+251922222222",
        location: "Hawassa, Ethiopia",
        bio: "Creative UI/UX and product designer passionate about clean design systems, glassmorphism aesthetics, and user research. Figma expert.",
        skills: ["UI/UX Design", "Figma", "Prototyping", "UX Research", "Wireframing"],
        primarySkill: "UI/UX Design",
        experienceLevel: "Mid-level",
        yearsOfExperience: "3",
        availability: "Available",
        monthlyRate: "30000",
        currency: "ETB",
        preferredJobTypes: ["Contract", "Freelance"],
        workLocation: "Remote",
        linkedinUrl: "https://linkedin.com/in/tsiongirma",
        isProfileComplete: true,
      }
    });

    // Client
    const client = new User({
      email: "techcorp@hustlex.com",
      password: "password123",
      roles: ["client"],
      currentRole: "client",
      profile: {
        firstName: "TechCorp",
        lastName: "Ethiopia",
        phone: "+251933333333",
        location: "Addis Ababa, Ethiopia",
        bio: "Leading technology provider building innovative digital solutions for businesses across East Africa.",
        skills: ["Management", "Scaling", "Software Engineering"],
        isProfileComplete: true,
      }
    });

    await freelancer1.save();
    await freelancer2.save();
    await client.save();
    print("✅ Seeded users (2 freelancers, 1 client).");

    // 4. Seed Projects using .save()
    print("🌱 Seeding Portfolio Projects...");
    const projectsData = [
      {
        title: "Enterprise E-Commerce SaaS",
        description: "Built a high-performance, SEO-optimized e-commerce platform using MERN stack, featuring Redis caching, server-side pre-rendering, and a micro-frontend architecture.",
        freelancer: freelancer1._id,
        images: ["/uploads/project-ecommerce.jpg"],
        tags: ["React", "Node.js", "MongoDB", "Redis"],
      },
      {
        title: "AI Document Summarizer",
        description: "Created an intelligent document parser integrating Gemini API and Python to summarize 100+ page PDF files in under 5 seconds.",
        freelancer: freelancer1._id,
        images: ["/uploads/project-ai.jpg"],
        tags: ["React", "Node.js", "Python", "Gemini API"],
      },
      {
        title: "Mobile Banking Interface",
        description: "A premium glassmorphic mobile UI design for a retail bank, featuring custom icon libraries, cohesive HSL theme integration, and high-fidelity prototype flows in Figma.",
        freelancer: freelancer2._id,
        images: ["/uploads/project-banking.jpg"],
        tags: ["UI/UX Design", "Figma", "Glassmorphism"],
      }
    ];

    const seededProjects = [];
    for (const proj of projectsData) {
      const doc = new Project(proj);
      await doc.save();
      seededProjects.push(doc);
    }
    print(`✅ Seeded ${seededProjects.length} projects.`);

    // 5. Seed Jobs using .save()
    print("🌱 Seeding Jobs...");
    const jobsData = [
      {
        title: "Senior React & Node.js Developer",
        description: "We are seeking a senior full-stack React and Node.js engineer to build our new core payment system. Must have experience with high-concurrency systems, state management, and Mongo schema tuning.",
        company: "TechCorp Ethiopia",
        budget: "35000",
        duration: "6 months",
        category: "Web & App Development",
        jobType: "Full-time",
        workLocation: "Remote",
        experience: "Senior",
        education: "Bachelor's Degree",
        gender: "Any",
        vacancies: 1,
        skills: ["React", "Node.js", "MongoDB", "TypeScript"],
        requirements: [
          "5+ years of software development experience",
          "Advanced proficiency in React, Node.js, and Express",
          "Familiarity with MongoDB indexing and aggregation pipelines",
          "Experience building payment integration modules"
        ],
        benefits: [
          "Flexible work hours",
          "Top-tier laptop allowance",
          "Performance bonuses",
          "Comprehensive health package"
        ],
        contactEmail: "jobs@techcorp.et",
        contactPhone: "+251933333333",
        companyWebsite: "https://techcorp.et",
        postedBy: client._id,
        isActive: true,
        approved: true,
      },
      {
        title: "Figma Product Designer",
        description: "Looking for an expert UI/UX product designer to create interactive Figma prototypes for our new mobile-first SaaS dashboard. Experience building clean, components-based design systems is required.",
        company: "TechCorp Ethiopia",
        budget: "15000",
        duration: "2 months",
        category: "Design & Graphics",
        jobType: "Contract",
        workLocation: "Remote",
        experience: "Mid-level",
        education: "Any",
        gender: "Any",
        vacancies: 1,
        skills: ["UI/UX Design", "Figma", "Prototyping"],
        requirements: [
          "3+ years designing mobile/web software",
          "Outstanding portfolio demonstrating UX workflows",
          "Deep mastery of Figma features (Auto-Layout, Variables)",
        ],
        benefits: [
          "Direct collaboration with product leads",
          "Opportunity for full-time conversion",
          "Modern workflows"
        ],
        contactEmail: "design@techcorp.et",
        contactPhone: "+251933333333",
        companyWebsite: "https://techcorp.et",
        postedBy: client._id,
        isActive: true,
        approved: true,
      }
    ];

    const seededJobs = [];
    for (const job of jobsData) {
      const doc = new Job(job);
      await doc.save();
      seededJobs.push(doc);
    }
    print(`✅ Seeded ${seededJobs.length} jobs.`);

    // 6. Seed Blogs using .save()
    print("🌱 Seeding Blogs...");
    const blogsData = [
      {
        title: "The Ultimate Guide to Hiring Remote MERN Developers in 2026",
        content: "As organizations scale, hiring remote engineering talent has transitioned from a nice-to-have to a core competitive advantage. This guide breaks down how to screen, interview, and onboard expert React and Node.js developers in the modern ecosystem. We cover evaluating coding samples, testing asynchronous communication skills, and structuring competitive compensation packages in East Africa.",
        category: "Guides",
        readTime: "5 min",
        author: "HustleX Editor",
        views: 245,
        likes: 42,
        isPublished: true,
      },
      {
        title: "Building Scalable Design Systems in Figma",
        content: "Design systems bridge the gap between design vision and software execution. In this tutorial, we analyze design system scaling strategies using Figma. Learn to use layout grids, set up logical type scales using Outfit/Inter fonts, customize theme values using Figma Variables, and design auto-layout components that behave perfectly under responsive testing.",
        category: "UX/UI Design",
        readTime: "4 min",
        author: "Tsion Girma",
        views: 180,
        likes: 38,
        isPublished: true,
      }
    ];

    const seededBlogs = [];
    for (const blog of blogsData) {
      const doc = new Blog(blog);
      await doc.save();
      seededBlogs.push(doc);
    }
    print(`✅ Seeded ${seededBlogs.length} blogs.`);

    print("⭐ Database SEO Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
