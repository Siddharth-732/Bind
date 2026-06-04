import mongoose, { Schema } from "mongoose";

const lodgeMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lodge: {
      type: Schema.Types.ObjectId,
      ref: "Lodge",
      required: true,
    },
    role: {
      type: String,
      enum: ["captain", "crew"],
      default: "crew", // default role
    },
  },
  {
    timestamps: true,
  },
);

// a user can only be added to a lodge once
lodgeMemberSchema.index({ user: 1, lodge: 1 }, { unique: true });

export const LodgeMember = mongoose.model("LodgeMember", lodgeMemberSchema);
