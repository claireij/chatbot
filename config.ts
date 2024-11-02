import dotenv from "dotenv";
dotenv.config();

export const mongodbPassword = process.env.MONGODB_PASSWORD || "";
export const mongodbUser = process.env.MONGODB_USER || "";
export const endpoint = process.env.ENDPOINT || "";