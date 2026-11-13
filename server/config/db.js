import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://ajazahmedmd8_db_user:qoSgGRbzv2fjSHyp@cluster3.dklozs7.mongodb.net/kisansetu?retryWrites=true&w=majority';

let isConnected = false;
let connectionError = null;

// Disable Mongoose buffering so operations fail fast if DB is disconnected
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 2500);
mongoose.set('strictQuery', false);

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    console.log('Connecting to MongoDB via Mongoose...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 6000,
    });

    isConnected = true;
    connectionError = null;
    console.log(`MongoDB Connected successfully to: ${mongoose.connection.name || 'kisansetu'}`);
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    connectionError = error.message || 'MongoDB connection error';
    console.warn('Mongoose connection notice (operating with local resilient cache):', connectionError);
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDBStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  return {
    isConnected: stateIndex === 1,
    state: states[stateIndex] || 'disconnected',
    dbName: mongoose.connection.name || 'kisansetu',
    error: connectionError,
  };
}

export default connectDB;
