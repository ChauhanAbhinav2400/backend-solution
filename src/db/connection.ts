import mongoose from "mongoose";
import { PORT, MONGODB_URI } from "../config/config";


export const connectToDB = async () => {
    try {
        const db = await mongoose
            .connect(MONGODB_URI as string)
        console.log("Connected to mongoDB");

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
