import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"; // this is for password encryption
import jwt from "jsonwebtoken"; // to generate access token for user
const userSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // this will makes searching fast
    },
    peers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // links to other users in the db
      },
    ],
    pendingRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    avatar: {
      type: String, //cloudinary
      default: "",
    },
    banner: {
      type: String, //cloudinary
      default: "",
    },
    bio: {
      type: String,
      default: "Available",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // If the password wasn't modified (or doesn't exist), move on
  if (!this.isModified("password")) return;

  // Hash the password with a salt of 10 rounds
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // If this is a Google Auth user, they won't have a password hash to compare
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      displayName: this.displayName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generates the long-lived Refresh Token (Only includes the ID)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
