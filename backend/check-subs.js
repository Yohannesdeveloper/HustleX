const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");

const checkSubscriptions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const users = await User.find({}, "email subscription roles");

        console.log("\n--- USER SUBSCRIPTIONS ---");
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Roles: ${u.roles}`);
            if (u.subscription) {
                console.log(`Plan: ${u.subscription.planId}`);
                console.log(`Status: ${u.subscription.status}`);
                console.log(`Method: ${u.subscription.paymentMethod}`);
            } else {
                console.log("No subscription");
            }
            console.log("------------------------");
        });

        // Count pending
        const pending = await User.countDocuments({ "subscription.status": "pending_approval" });
        console.log(`\nTotal pending_approval: ${pending}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkSubscriptions();
