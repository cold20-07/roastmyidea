import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let useMockDb = false;

// Use global to persist across module reloads in development
if (!global.inMemoryIdeas) {
  global.inMemoryIdeas = [];
}

const mockDb = {
  collection: (name) => ({
    insertOne: async (doc) => {
      global.inMemoryIdeas.push(doc);
      console.log(`✓ Stored idea in memory. Total: ${global.inMemoryIdeas.length}`);
      return { insertedId: doc.id };
    },
    findOne: async (query) => {
      const found = global.inMemoryIdeas.find(idea => idea.id === query.id);
      console.log(`Searching for ID ${query.id}: ${found ? 'Found' : 'Not found'} (Total in memory: ${global.inMemoryIdeas.length})`);
      return found;
    },
    find: (query) => ({
      sort: () => ({
        skip: (offset) => ({
          limit: (limit) => ({
            toArray: async () => {
              return global.inMemoryIdeas.slice(offset, offset + limit);
            }
          })
        })
      })
    }),
    countDocuments: async () => global.inMemoryIdeas.length,
    updateOne: async (query, update) => {
      const idea = global.inMemoryIdeas.find(i => i.id === query.id);
      if (idea && update.$inc) {
        Object.keys(update.$inc).forEach(key => {
          idea[key] = (idea[key] || 0) + update.$inc[key];
        });
      }
      return { modifiedCount: idea ? 1 : 0 };
    }
  })
};

export async function getDb() {
  // Always return the same instance
  if (db) return db;
  
  // Skip MongoDB connection if no URL is provided
  if (!process.env.MONGO_URL || process.env.MONGO_URL === 'mongodb://localhost:27017') {
    if (!useMockDb) {
      console.warn('⚠ MongoDB not configured, using in-memory storage');
      useMockDb = true;
    }
    return mockDb;
  }

  // Only try MongoDB connection once
  if (useMockDb) {
    return mockDb;
  }

  try {
    client = new MongoClient(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 2000, // Fail fast for serverless
      connectTimeoutMS: 2000,
    });
    await client.connect();
    db = client.db(process.env.DB_NAME || 'roastmyidea');
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.warn('⚠ MongoDB connection failed, using in-memory storage');
    useMockDb = true;
    return mockDb;
  }
}