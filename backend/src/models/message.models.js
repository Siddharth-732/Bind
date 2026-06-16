import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Message = mongoose.model("Message", messageSchema);
