import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Find the users collection
    const usersCollection = collections.find(c => c.name === 'users');
    if (!usersCollection) {
      console.log('Users collection not found');
      return;
    }

    // Get all indexes
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    // Drop the username index if it exists
    const usernameIndex = indexes.find(i => i.name === 'username_1');
    if (usernameIndex) {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username index');
    } else {
      console.log('Username index not found');
    }

    // Drop the googleId index if it exists
    const googleIdIndex = indexes.find(i => i.name === 'googleId_1');
    if (googleIdIndex) {
      await db.collection('users').dropIndex('googleId_1');
      console.log('Dropped googleId index');
    } else {
      console.log('GoogleId index not found');
    }

    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

dropIndex(); 