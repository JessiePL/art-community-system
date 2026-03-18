import "dotenv/config";
import { connectDB } from "./db";

async function startServer() {
  try {
    await connectDB();
    console.log("✅ Server startup check passed");
    process.exit(0); 
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

startServer();

