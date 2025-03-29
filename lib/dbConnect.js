const mongoose = require('mongoose');

// Skip MongoDB connection check during build phase
if (process.env.NEXT_PHASE === 'build') {
  module.exports = async () => {};
} else {
  // Only throw error if we're not in a build environment
  if (!process.env.MONGO_URL && !process.env.MONGODB_URI) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Please define the MONGO_URL or MONGODB_URI environment variable inside .env.local');
    }
  }

  const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI;

  let cached = global.mongoose;

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  async function dbConnect() {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      throw e;
    }

    return cached.conn;
  }

  module.exports = dbConnect;
}
