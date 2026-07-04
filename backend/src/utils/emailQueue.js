import { Queue } from "bullmq";
import { Redis } from "ioredis";
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL is not defined in backend .env. Redis connection and email queue will fail.",
  );
}

// connect the Producer to the same broker
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0,
});

redisClient.on("error", (err) => {
  console.error("Backend Redis connection error:", err.message);
});

// match the Consumer's QUEUE_NAME
const QUEUE_NAME = "email-queue";

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs in Redis for debugging
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

emailQueue.on("error", (err) => {
  console.error("Backend Queue error:", err.message);
});

console.log("Backend Email Producer connected to queue.");
