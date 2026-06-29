import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("(BAD) REDIS_URL is not defined in the .env file.");
  process.exit(1);
}

// Initialize Redis Client
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

connection.on("connect", () => {
  console.log("(GOOD) Successfully connected to Redis Broker.");
});

connection.on("error", (err) => {
  console.error("(BAD) Redis connection error:", err);
});

export default connection;
