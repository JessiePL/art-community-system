import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

export const db = client.db("mvp_store");

export async function connectDB() {
  await client.connect();
  console.log("MongoDB connected");
}

