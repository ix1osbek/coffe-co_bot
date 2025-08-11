import { Bot } from "grammy";
import { BOT_TOKEN } from "../config/environments";
import { MyContext } from "../typings/interfaces/my-contex";

export const bot = new Bot<MyContext>(BOT_TOKEN);
