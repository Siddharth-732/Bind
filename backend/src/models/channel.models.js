import mongoose, { Schema } from "mongoose";

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
    lodge: {
      type: Schema.Types.ObjectId,
      ref: "Lodge",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Channel = mongoose.model("Channel", channelSchema);
