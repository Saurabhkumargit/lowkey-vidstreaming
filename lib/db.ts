
import mongoose from 'mongoose';

// Don't read env vars at module evaluation time — that can run in client-side dev
// tooling and will crash if MONGODB_URI is not available. Read inside the
// connectToDatabase function instead.

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

    if (!MONGODB_URI) {
      // During dev Turbopack may evaluate modules in contexts where env isn't loaded.
      // Don't throw during module evaluation — log and return the mongoose instance
      // (unconnected). Callers should handle connection failures when using the DB.
      console.warn('MONGODB_URI is not defined — skipping DB connect. Set MONGODB_URI in .env.local');
      return mongoose;
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(
      `Failed to connect to MongoDB. Please check that your MongoDB server is running and your MONGODB_URI is correct.`
    );
  }

  return cached.conn;
}

export { connectToDatabase };