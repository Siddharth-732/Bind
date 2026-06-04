import mongoose, { Schema } from "mongoose";

const statusSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    trim: true,
    default: "", // Text content (optional if media is provided)
  },
  mediaUrl: {
    type: String, // Cloudinary URL
    default: "",
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "none"],
    default: "none",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 86400 seconds = 24 hours. MongoDB will automatically delete documents older than this!
  },
});

export const Status = mongoose.model("Status", statusSchema);
