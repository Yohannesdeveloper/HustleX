const mongoose = require("mongoose");
const path = require("path");

// Load .env explicitly
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log("Attempting to connect to MongoDB...");
        // console.log("URI:", uri); // Careful not to log sensitive info in final code, but for now just checking existence
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

const clearFreelancers = async () => {
    try {
        await connectDB();

        console.log("Checking for freelancers...");

        // Find before deleting
        const count = await User.countDocuments({ roles: "freelancer" });
        console.log(`Found ${count} users with role 'freelancer'.`);

        if (count > 0) {
            console.log("Deleting freelancers...");
            const result = await User.deleteMany({ roles: "freelancer" });
            console.log(`Deleted ${result.deletedCount} freelancers.`);

            // Also cleanup applications and messages if needed
            // Assuming models exist or using generic approach
            try {
                if (mongoose.models.Application) {
                    const appResult = await mongoose.model('Application').deleteMany({ freelancerId: { $exists: true } });
                    console.log(`Deleted ${appResult.deletedCount} related applications.`);
                } else {
                    console.log("Application model not registered, skipping application cleanup.");
                }
            } catch (e) {
                console.log("Error cleaning applications:", e.message);
            }

        } else {
            console.log("No freelancers to delete.");
        }

        console.log("Done.");
    } catch (error) {
        console.error("Error executing script:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Connection closed.");
        process.exit(0);
    }
};

clearFreelancers();
