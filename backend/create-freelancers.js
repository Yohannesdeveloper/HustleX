const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const sampleFreelancers = [
  {
    email: "john.doe@hustlex.com",
    password: "freelancer123",
    roles: ["freelancer"],
    currentRole: "freelancer",
    profile: {
      firstName: "John",
      lastName: "Doe",
      phone: "+251911111111",
      location: "Addis Ababa, Ethiopia",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      primarySkill: "Full Stack Development",
      experienceLevel: "Mid-level",
      yearsOfExperience: "3",
      bio: "Full-stack developer with expertise in modern web technologies. Passionate about creating scalable and efficient applications.",
      availability: "Available",
      isProfileComplete: true
    }
  },
  {
    email: "sarah.smith@hustlex.com",
    password: "freelancer123",
    roles: ["freelancer"],
    currentRole: "freelancer",
    profile: {
      firstName: "Sarah",
      lastName: "Smith",
      phone: "+251922222222",
      location: "Addis Ababa, Ethiopia",
      skills: ["UI/UX Design", "Figma", "Adobe XD", "Photoshop"],
      primarySkill: "UI/UX Design",
      experienceLevel: "Senior",
      yearsOfExperience: "4",
      bio: "Creative UI/UX designer with a passion for user-centered design. Experienced in creating beautiful and functional interfaces.",
      availability: "Available",
      isProfileComplete: true
    }
  },
  {
    email: "mike.johnson@hustlex.com",
    password: "freelancer123",
    roles: ["freelancer"],
    currentRole: "freelancer",
    profile: {
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+251933333333",
      location: "Dire Dawa, Ethiopia",
      skills: ["Content Writing", "SEO", "Copywriting", "Blogging"],
      primarySkill: "Content Writing",
      experienceLevel: "Junior",
      yearsOfExperience: "2",
      bio: "Professional content writer specializing in SEO-optimized articles and marketing copy. Helping businesses tell their stories effectively.",
      availability: "Available",
      isProfileComplete: true
    }
  }
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

const createFreelancers = async () => {
  try {
    await connectDB();

    console.log("Creating sample freelancers...");

    for (const freelancerData of sampleFreelancers) {
      const existingUser = await User.findOne({ email: freelancerData.email });
      if (existingUser) {
        console.log(`Freelancer ${freelancerData.email} already exists, skipping...`);
        continue;
      }

      const freelancer = new User(freelancerData);
      await freelancer.save();
      console.log(`Created freelancer: ${freelancer.email}`);
    }

    console.log("Freelancers creation completed!");
    console.log("Sample freelancer accounts:");
    sampleFreelancers.forEach(f => {
      console.log(`- ${f.email} / ${f.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating freelancers:", error);
    process.exit(1);
  }
};

createFreelancers();
