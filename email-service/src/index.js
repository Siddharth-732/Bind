import "./setup.js";
import http from "http";

import { connectDB } from "./config/db.js";
import "./config/redisClient.js";
import "./workers/emailWorker.js";

connectDB();

console.log(" Email Microservice is running and listening for jobs...");

// Dummy HTTP server to pass Render's Web Service health check
const PORT = process.env.PORT || 4000;
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bind Email Service is running in the background.");
  })
  .listen(PORT, () => {
    console.log(` Dummy Health Check server listening on port ${PORT}`);
  });
