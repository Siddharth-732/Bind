import mongoose, { Schema } from "mongoose";

const lodgeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String, // Cloudinary URL
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lodge = mongoose.model("Lodge", lodgeSchema);
