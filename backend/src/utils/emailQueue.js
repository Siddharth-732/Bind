import { Queue } from "bullmq";
import { Redis } from "ioredis";
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn(
    "REDIS_URL is not defined in backend .env. The email queue will not work.",
  );
}

// connect the Producer to the same broker
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// match the Consumer's QUEUE_NAME
const QUEUE_NAME = "email-queue";

export const emailQueue = new Queue(QUEUE_NAME, {
  connection,
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

console.log("Backend Email Producer connected to queue.");
