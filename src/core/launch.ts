import { Bot } from "grammy";
import { UserFromGetMe } from "grammy/types";
import { MyContext } from "../typings/interfaces/my-contex";

export const launch = async (bot: Bot<MyContext>) => {
  await bot.start({
    onStart: (me: UserFromGetMe) =>
      console.log(`Bot launched as @${me.username}`),
  });
};
