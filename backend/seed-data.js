const mongoose = require("mongoose");
const Job = require("./models/Job");
const User = require("./models/User");
require("dotenv").config();

const sampleUser = {
  email: "admin@hustlex.com",
  password: "admin123",
  roles: ["client"],
  currentRole: "client",
  profile: {
    firstName: "Admin",
    lastName: "User",
    phone: "+251900000000",
    location: "Addis Ababa, Ethiopia",
    skills: ["Management", "Hiring"],
    primarySkill: "Project Management",
    experienceLevel: "Senior",
    yearsOfExperience: "5",
    bio: "Administrator account for managing job postings",
    availability: "Available",
    isProfileComplete: true
  },
};

const sampleJobs = [
  {
    title: "Frontend React Developer",
    description:
      "We are looking for a skilled React developer to join our team and help build amazing user interfaces. The ideal candidate should have experience with modern React, TypeScript, and CSS frameworks.",
    company: "TechCorp Ethiopia",
    budget: "25000",
    duration: "3 months",
    category: "Web & App Development",
    jobType: "Full-time",
    workLocation: "Remote",
    experience: "Mid-level",
    education: "Bachelor's Degree",
    gender: "Any",
    vacancies: 2,
    skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
    requirements: [
      "3+ years of React experience",
      "Strong TypeScript skills",
      "Experience with modern CSS frameworks",
      "Good understanding of responsive design",
    ],
    benefits: [
      "Competitive salary",
      "Remote work options",
      "Professional development",
      "Health insurance",
    ],
    contactEmail: "hr@techcorp.et",
    contactPhone: "+251911234567",
    companyWebsite: "https://techcorp.et",
    isActive: true,
  },
  {
    title: "UI/UX Designer",
    description:
      "Creative UI/UX designer needed to design beautiful and functional user interfaces for our mobile and web applications. Must have a strong portfolio and experience with design tools.",
    company: "Design Studio Ethiopia",
    budget: "20000",
    duration: "2 months",
    category: "Design & Graphics",
    jobType: "Contract",
    workLocation: "Hybrid",
    experience: "Junior",
    education: "Bachelor's Degree",
    gender: "Any",
    vacancies: 1,
    skills: [
      "Figma",
      "Adobe Creative Suite",
      "UI Design",
      "UX Research",
      "Prototyping",
    ],
    requirements: [
      "2+ years of design experience",
      "Proficiency in Figma and Adobe tools",
      "Strong understanding of user-centered design",
      "Portfolio showcasing previous work",
    ],
    benefits: [
      "Flexible working hours",
      "Creative freedom",
      "Modern office space",
      "Team collaboration",
    ],
    contactEmail: "design@designstudio.et",
    contactPhone: "+251922345678",
    companyWebsite: "https://designstudio.et",
    isActive: true,
  },
  {
    title: "Content Writer",
    description:
      "Experienced content writer needed to create engaging blog posts, articles, and marketing copy for our clients. Must have excellent writing skills and SEO knowledge.",
    company: "Content Hub Ethiopia",
    budget: "15000",
    duration: "1 month",
    category: "Writing & Translation",
    jobType: "Freelance",
    workLocation: "Remote",
    experience: "Entry Level",
    education: "Bachelor's Degree",
    gender: "Any",
    vacancies: 3,
    skills: ["Content Writing", "SEO", "Copywriting", "Research", "Editing"],
    requirements: [
      "1+ year of writing experience",
      "Basic SEO knowledge",
      "Excellent grammar and spelling",
      "Ability to meet deadlines",
    ],
    benefits: [
      "Work from anywhere",
      "Flexible schedule",
      "Performance bonuses",
      "Skill development",
    ],
    contactEmail: "content@contenthub.et",
    contactPhone: "+251933456789",
    companyWebsite: "https://contenthub.et",
    isActive: true,
  },
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hustlex",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Job.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Create sample user
    const user = new User(sampleUser);
    await user.save();
    console.log("Created sample user:", user.email);

    // Add postedBy field to all jobs
    const jobsWithUser = sampleJobs.map((job) => ({
      ...job,
      postedBy: user._id,
    }));

    // Insert sample jobs
    const createdJobs = await Job.insertMany(jobsWithUser);
    console.log(`Created ${createdJobs.length} sample jobs`);

    console.log("Database seeded successfully!");
    console.log("Sample user email:", sampleUser.email);
    console.log("Sample user password:", sampleUser.password);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
