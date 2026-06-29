import { Worker } from "bullmq";
import redisClient from "../config/redisClient.js";
import { sendEmail } from "../config/mailer.js";
import { getVerificationEmailTemplate } from "../templates/verificationTemplate.js";

const QUEUE_NAME = "email-queue";

console.log(" Email Worker is starting...");

const emailWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`\n Processing job [${job.id}]: ${job.name}`);

    // the producer sends us: { email, userId, token }
    // email : user email
    // userId : user id
    // token : verification token
    const { email, userId, token } = job.data;

    let subject = "";
    let htmlContent = "";

    if (job.name === "send-verification") {
      subject = "Verify your Bind Account";
      htmlContent = getVerificationEmailTemplate(userId, token);
    } else {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    // Call Nodemailer to actually send the email
    const info = await sendEmail(email, subject, htmlContent);

    return { success: true, messageId: info.messageId };
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
