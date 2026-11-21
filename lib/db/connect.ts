import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailedAt: number | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, lastFailedAt: null };
if (!global.mongooseCache) global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cached.conn) return cached.conn;

  // If connection failed recently (within last 60s), avoid blocking requests
  if (cached.lastFailedAt && Date.now() - cached.lastFailedAt < 60000) {
    throw new Error('MongoDB previously unreachable; skipping retry temporarily');
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 1200,
        connectTimeoutMS: 1200,
      });
    }

    cached.conn = await cached.promise;
    cached.lastFailedAt = null;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.lastFailedAt = Date.now();
    throw err;
  }
}

export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}
