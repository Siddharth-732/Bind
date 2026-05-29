import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    // this array is for exactly 2 user ID
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // an array holding the IDs of all the messages in this chat
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    // a quick reference to the newest message for the sidebar preview
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  },
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
