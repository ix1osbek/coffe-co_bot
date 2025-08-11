import mongoose from "mongoose";
import { DATABASE_URL } from "../config/environments";

export const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);

    console.log("DB connected");
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
};
