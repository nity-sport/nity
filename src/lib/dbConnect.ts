
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

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
    try {
        console.log('[DB] dbConnect called');
        console.log('[DB] MONGODB_URI exists:', !!MONGODB_URI);
        console.log('[DB] Cached connection exists:', !!cached.conn);
        
        if (cached.conn) {
            console.log('[DB] Using cached connection');
            return cached.conn;
        }
        
        if (!cached.promise) {
            console.log('[DB] Creating new connection...');
            cached.promise = mongoose.connect(MONGODB_URI, {
                bufferCommands: false,
            });
        }
        
        console.log('[DB] Waiting for connection...');
        cached.conn = await cached.promise;
        console.log('[DB] Database connected successfully');
        console.log('[DB] Connection state:', mongoose.connection.readyState);
        
        return cached.conn;
    } catch (error) {
        console.error('[DB] Database connection error:', error);
        // Reset the cached promise so we can try again
        cached.promise = null;
        throw error;
    }
}

export default dbConnect;
