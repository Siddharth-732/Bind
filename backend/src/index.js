import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import http from "http";
import { initializeSocket } from "./socket/index.js";
dotenv.config({
  path: "./.env",
});

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port :", `${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("failed to establish connection with MONGO_database", error);
  });
