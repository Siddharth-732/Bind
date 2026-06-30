import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    jobName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    },
    errorReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
