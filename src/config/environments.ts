import * as dotenv from "dotenv";

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN as string;

export const DATABASE_URL = process.env.DATABASE_URL as string;

export const ADMINS =
  process.env.ADMINS?.split(",").map((id) => Number(id)) || [];

export const FEEDBACK_CHANNEL = process.env.FEEDBACK_CHANNEL as string;

export const ERROR_CHANNELID = process.env.ERROR_CHANNELID as string;

export const LOYVERSE_API_BASEURL = process.env.LOYVERSE_API_BASEURL as string;

export const LOYVERSE_API_SECRET = process.env.LOYVERSE_API_SECRET;
