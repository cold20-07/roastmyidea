import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let useMockDb = false;

// In-memory storage when MongoDB is unavailable
const mockDb = {
  ideas: [],
  collection: (name) => ({
    insertOne: async (doc) => {
      mockDb.ideas.push(doc);
      return { insertedId: doc.id };
    },
    findOne: async (query) => {
      return mockDb.ideas.find(idea => idea.id === query.id);
    },
    find: (query) => ({
      sort: () => ({
        skip: (offset) => ({
          limit: (limit) => ({
            toArray: async () => {
              return mockDb.ideas.slice(offset, offset + limit);
            }
          })
        })
      })
    }),
    countDocuments: async () => mockDb.ideas.length,
    updateOne: async (query, update) => {
      const idea = mockDb.ideas.find(i => i.id === query.id);
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
  if (db) return db;
  if (useMockDb) return mockDb;

  // Skip MongoDB connection if no URL is provided
  if (!process.env.MONGO_URL || process.env.MONGO_URL === 'mongodb://localhost:27017') {
    console.warn('⚠ MongoDB not configured, using in-memory storage');
    useMockDb = true;
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