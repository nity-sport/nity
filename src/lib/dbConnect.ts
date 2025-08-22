import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI)
  throw new Error('Please define the MONGODB_URI environment variable');

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  try {
    logger.debug('dbConnect called');
    logger.debug('MONGODB_URI exists:', { exists: !!MONGODB_URI });
    logger.debug('Cached connection exists:', { exists: !!cached.conn });

    if (cached.conn) {
      logger.debug('Using cached connection');
      return cached.conn;
    }

    if (!cached.promise) {
      logger.info('Creating new database connection...');
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
    }

    logger.debug('Waiting for connection...');
    cached.conn = await cached.promise;
    logger.info('Database connected successfully');
    logger.debug('Connection state:', { state: mongoose.connection.readyState });

    return cached.conn;
  } catch (error) {
    logger.error('Database connection error:', error);
    // Reset the cached promise so we can try again
    if (cached) {
      cached.promise = null;
    }
    throw error;
  }
}

export default dbConnect;
