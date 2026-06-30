import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn(" MONGODB_URI is missing in email-service/.env");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(` MongoDB Connected (Email Service): ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
  }
};
