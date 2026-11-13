import { MongoClient, Db } from 'mongodb';

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://ajazahmedmd7_db_user:Q5vQqmRPyb0SRiEy@cluster0.undt0bd.mongodb.net/?retryWrites=true&w=majority';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;

export async function initMongo(): Promise<{ isConnected: boolean; db: Db | null; error: string | null }> {
  if (db && isConnected) {
    return { isConnected: true, db, error: null };
  }

  try {
    console.log('Connecting to MongoDB cluster: cluster0.undt0bd.mongodb.net ...');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 8000,
    });
    await client.connect();
    db = client.db('kisansetu');
    isConnected = true;
    connectionError = null;
    console.log('MongoDB successfully connected to database: kisansetu');

    // Create unique index on user id if not present
    try {
      await db.collection('users').createIndex({ id: 1 }, { unique: true });
      await db.collection('crop_lots').createIndex({ id: 1 }, { unique: true });
    } catch (idxErr) {
      // index might already exist
    }

    return { isConnected: true, db, error: null };
  } catch (err: any) {
    isConnected = false;
    connectionError = err?.message || 'Failed to connect to MongoDB cluster';
    console.info('MongoDB cluster initialization deferred (using cloud Firestore/in-memory)');
    return { isConnected: false, db: null, error: 'Database fallback mode' };
  }
}

export function getMongoDb(): Db | null {
  return db;
}

export function getMongoStatus() {
  return {
    isConnected,
    uri: 'mongodb+srv://cluster0.undt0bd.mongodb.net/kisansetu',
    dbName: 'kisansetu',
    error: connectionError,
  };
}

export async function mongoFind<T>(collectionName: string, query: any = {}): Promise<T[] | null> {
  if (!db || !isConnected) return null;
  try {
    const docs = await db.collection(collectionName).find(query).toArray();
    return docs as unknown as T[];
  } catch (err) {
    console.warn(`MongoDB find error on ${collectionName}:`, err);
    return null;
  }
}

export async function mongoInsertOne<T>(collectionName: string, doc: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    await db.collection(collectionName).insertOne({ ...doc, _createdAt: new Date() });
    return true;
  } catch (err) {
    console.warn(`MongoDB insert error on ${collectionName}:`, err);
    return false;
  }
}

export async function mongoUpsert<T>(collectionName: string, filter: any, doc: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    await db.collection(collectionName).updateOne(
      filter,
      { $set: { ...doc, _updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.warn(`MongoDB upsert error on ${collectionName}:`, err);
    return false;
  }
}

export async function mongoUpdate<T>(collectionName: string, filter: any, updateData: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    await db.collection(collectionName).updateOne(filter, { $set: updateData });
    return true;
  } catch (err) {
    console.warn(`MongoDB update error on ${collectionName}:`, err);
    return false;
  }
}

export async function mongoDeleteOne(collectionName: string, filter: any): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const result = await db.collection(collectionName).deleteOne(filter);
    return result.deletedCount > 0;
  } catch (err) {
    console.warn(`MongoDB delete error on ${collectionName}:`, err);
    return false;
  }
}
