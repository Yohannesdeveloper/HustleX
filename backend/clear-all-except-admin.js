const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

console.log("🚀 Script started...");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ MONGODB_URI is not defined in .env");
            process.exit(1);
        }
        console.log(`📡 Connecting to MongoDB...`);
        const conn = await mongoose.connect(
            uri,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 15000, // Timeout after 15s
            }
        );
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("❌ Database connection error:", error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const clearExceptAdmin = async () => {
    try {
        await connectDB();

        console.log("🔍 Checking existing users...");

        // Find all users
        const allUsers = await User.find({}).lean();
        console.log(`Total users in database: ${allUsers.length}`);

        if (allUsers.length === 0) {
            console.log('✅ No users found in database.');
            return;
        }

        // Separate admins and non-admins
        const admins = allUsers.filter(user => user.roles && user.roles.includes("admin"));
        const nonAdmins = allUsers.filter(user => !user.roles || !user.roles.includes("admin"));

        console.log(`\nAdmins found (${admins.length}):`);
        admins.forEach(u => console.log(`- ${u.email} (${u.roles.join(', ')})`));

        console.log(`\nNon-admins found (${nonAdmins.length}):`);
        nonAdmins.forEach(u => console.log(`- ${u.email} (${u.roles ? u.roles.join(', ') : 'no roles'})`));

        if (nonAdmins.length === 0) {
            console.log('\n✅ No non-admin users found to delete.');
        } else {
            console.log(`\n⚠️  WARNING: This will permanently delete ${nonAdmins.length} users!`);

            const nonAdminIds = nonAdmins.map(u => u._id);

            console.log('🗑️  Deleting non-admin users...');
            const result = await User.deleteMany({ _id: { $in: nonAdminIds } });
            console.log(`✅ Successfully deleted ${result.deletedCount} users`);
        }

        // Clear related data
        console.log('\n🧹 Cleaning up related data...');
        try {
            const adminIds = admins.map(a => a._id);

            // Define schemas if models aren't already registered
            const jobSchema = new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId }, { strict: false });
            const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
            const jobResult = await Job.deleteMany({ owner: { $nin: adminIds } });
            console.log(`✅ Cleared ${jobResult.deletedCount} jobs not owned by admin`);

            const appSchema = new mongoose.Schema({}, { strict: false });
            const Application = mongoose.models.Application || mongoose.model('Application', appSchema);
            const appResult = await Application.deleteMany({});
            console.log(`✅ Cleared ${appResult.deletedCount} applications`);

            const msgSchema = new mongoose.Schema({}, { strict: false });
            const Message = mongoose.models.Message || mongoose.model('Message', msgSchema);
            const messageResult = await Message.deleteMany({});
            console.log(`✅ Cleared ${messageResult.deletedCount} messages`);

            const companySchema = new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId }, { strict: false });
            const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
            const companyResult = await Company.deleteMany({ owner: { $nin: adminIds } });
            console.log(`✅ Cleared ${companyResult.deletedCount} companies not owned by admin`);

        } catch (error) {
            console.log('Note: Some related data might not have been cleared:', error.message);
        }

        console.log('\n🎉 Cleanup complete!');

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    } finally {
        if (mongoose.connection) {
            await mongoose.connection.close();
            console.log('Database connection closed.');
        }
        process.exit(0);
    }
};

clearExceptAdmin();
