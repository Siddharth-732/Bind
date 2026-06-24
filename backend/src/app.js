import express from "express";
import cors from "cors";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import lodgeRouter from "./routes/lodge.routes.js";
import statusRouter from "./routes/status.routes.js";
import postRouter from "./routes/post.routes.js";
import cookieParser from "cookie-parser";
const app = express();

const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.trim().replace(/\/$/, "") 
  : "";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/lodges", lodgeRouter);
app.use("/api/v1/statuses", statusRouter);
app.use("/api/v1/posts", postRouter);

export default app;
