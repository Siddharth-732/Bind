import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import { sendEmail } from "../config/mailer.js";
import { getOTPEmailTemplate } from "../templates/otpTemplate.js";
import { getWelcomeEmailTemplate } from "../templates/welcomeTemplate.js";
import { EmailLog } from "../models/emailLog.js";

const QUEUE_NAME = "email-queue";

console.log(" Email Worker is starting...");

const emailWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`\n Processing job [${job.id}]: ${job.name}`);

    // For send-otp: { email, otp }
    // For send-welcome: { email, name }
    const { email, otp, name } = job.data;

    // 1. Create a "pending" log in MongoDB
    let logEntry;
    try {
      logEntry = await EmailLog.create({
        jobId: job.id,
        recipientEmail: email,
        jobName: job.name,
        status: "pending",
      });
    } catch (e) {
      console.error("Failed to create log entry:", e);
    }

    let subject = "";
    let htmlContent = "";

    if (job.name === "send-otp") {
      subject = "Verify your Bind Account";
      htmlContent = getOTPEmailTemplate(otp);
    } else if (job.name === "send-welcome") {
      subject = "Welcome to Bind! 🎉";
      htmlContent = getWelcomeEmailTemplate(name);
    } else {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    try {
      // 2. Try to actually send the email via Nodemailer
      const info = await sendEmail(email, subject, htmlContent);

      // 3. If successful, update MongoDB log to "success"
      if (logEntry) {
        logEntry.status = "success";
        await logEntry.save();
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      // 4. If it crashes, update MongoDB log to "failed" with the exact reason
      if (logEntry) {
        logEntry.status = "failed";
        logEntry.errorReason = error.message;
        await logEntry.save();
      }
      throw error;
    }
  },
  {
    connection: redisClient,
    // Leaky Bucket process max 1 email every 2 seconds (2000ms)
    limiter: {
      max: 1,
      duration: 2000,
    },
  },
);

emailWorker.on("completed", (job) => {
  console.log(` Job [${job.id}] completed successfully.`);
});

emailWorker.on("failed", (job, err) => {
  console.error(` Job [${job.id}] failed with error:`, err.message);
});

export default emailWorker;
