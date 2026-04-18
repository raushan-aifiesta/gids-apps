import { MongoClient, type Db, type Collection } from "mongodb";
import type {
  SessionDocument,
  LeaderboardDocument,
  UserDocument,
} from "@/drizzle/schema";
import { COLLECTIONS } from "@/drizzle/schema";

// ─── Singleton client (recommended by MongoDB Node.js driver docs) ───────────
let client: MongoClient | null = null;
let db: Db | null = null;

async function getClient(): Promise<MongoClient> {
  if (client) return client;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  });

  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  const c = await getClient();
  db = c.db("interview-coach");
  return db;
}

// ─── Typed collection accessors ──────────────────────────────────────────────
export async function getSessionsCollection(): Promise<
  Collection<SessionDocument>
> {
  const database = await getDb();
  return database.collection<SessionDocument>(COLLECTIONS.SESSIONS);
}

export async function getLeaderboardCollection(): Promise<
  Collection<LeaderboardDocument>
> {
  const database = await getDb();
  const col = database.collection<LeaderboardDocument>(COLLECTIONS.LEADERBOARD);
  // Ensure TTL + performance index (idempotent)
  await col
    .createIndex({ score: -1 })
    .catch(() => {/* index may already exist */});
  return col;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await getDb();
  const col = database.collection<UserDocument>(COLLECTIONS.USERS);
  await col
    .createIndex({ email: 1 }, { unique: true })
    .catch(() => {/* index may already exist */});
  return col;
}
