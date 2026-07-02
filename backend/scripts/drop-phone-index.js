
require('dotenv').config();
const mongoose = require('mongoose');

async function dropPhoneIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collection = mongoose.connection.db.collection('users');

    // List all indexes on the users collection
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes on users collection:');
    indexes.forEach(index => console.log(`  - ${index.name}`, index.key));

    // Find and drop ALL indexes that include profile.phone
    let droppedCount = 0;
    for (const index of indexes) {
      if (index.key && index.key['profile.phone']) {
        console.log(`\n🗑️ Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
        console.log('✅ Successfully dropped index!');
        droppedCount++;
      }
    }

    if (droppedCount === 0) {
      console.log('\nℹ️ No indexes on profile.phone found to drop!');
    }

    console.log('\n✅ Done! Now let\'s list all indexes again to confirm:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => console.log(`  - ${index.name}`, index.key));
    
    console.log('\n✅ All done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

dropPhoneIndex();
