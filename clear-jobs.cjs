const mongoose = require('mongoose');
require('dotenv').config();

// Job model (simplified for clearing)
const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

async function clearAllJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethihustle', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Count jobs before deletion
    const jobCount = await Job.countDocuments();
    console.log(`Found ${jobCount} jobs in the database`);

    if (jobCount === 0) {
      console.log('No jobs to clear. Database is already empty.');
      return;
    }

    // Delete all jobs
    const result = await Job.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} jobs`);

    // Also clear applications if they exist
    try {
      const Application = mongoose.model('Application', new mongoose.Schema({}));
      const appCount = await Application.countDocuments();
      if (appCount > 0) {
        const appResult = await Application.deleteMany({});
        console.log(`✅ Also cleared ${appResult.deletedCount} applications`);
      }
    } catch (error) {
      console.log('No applications collection found or already cleared');
    }

    console.log('🎉 All jobs cleared successfully! You can now start fresh.');

  } catch (error) {
    console.error('Error clearing jobs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the function
clearAllJobs();
