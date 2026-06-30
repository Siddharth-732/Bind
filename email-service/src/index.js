import { connectDB } from "./config/db.js";
import "./config/redisClient.js";
import "./workers/emailWorker.js";

// Connect to MongoDB
connectDB();

console.log(" Email Microservice is running and listening for jobs...");
