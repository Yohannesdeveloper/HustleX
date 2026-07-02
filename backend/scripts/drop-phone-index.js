
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function dropPhoneIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // List all indexes on the users collection
    const indexes = await User.collection.indexes();
    console.log('Current indexes on users collection:');
    indexes.forEach(index => console.log(`  -', index.name, index.key));

    // Find and drop the index on profile.phone
    for (const index of indexes) {
      if (index.key && index.key['profile.phone']) {
        console.log(`\nDropping index:', index.name);
        await User.collection.dropIndex(index.name);
        console.log('Successfully dropped index!');
      }
      // Also check for any other indexes that start with profile.phone
    }

    console.log('\nDone! Now let's list all indexes again to confirm:');
    const newIndexes = await User.collection.indexes();
    newIndexes.forEach(index => console.log(`  -', index.name, index.key));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropPhoneIndex();
