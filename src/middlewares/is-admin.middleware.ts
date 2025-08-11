import { GrammyError, NextFunction } from "grammy";
import { MyContext } from "../typings/interfaces/my-contex";
import { MESSAGES } from "../typings/enums/messages";
import { RoleUser, User } from "../models/user.model";
import { SCENES } from "../typings/enums/scenes";
import { handleError } from "./handle-error";
import { ADMINS } from "../config/environments";

export const isAdmin = async (
  ctx: MyContext,
  next: NextFunction
): Promise<void> => {
  try {
    const fromId = ctx.from?.id;

    if (!fromId) {
      await ctx.reply(MESSAGES.MUST_USE_TELEGRAM);
      return;
    }

    const isAdmin = ADMINS.includes(fromId);

    if (ctx.session.user?.role === RoleUser.ADMIN || isAdmin) {
      return await next();
    }

    const user = await User.findOne({ chat_id: fromId }).lean().exec();

    if (!user) {
      return ctx.scenes.enter(SCENES.AUTH);
    }

    ctx.session.user = user;

    if (user.role === RoleUser.ADMIN || isAdmin) {
      return await next();
    }

    await ctx.reply(MESSAGES.YOU_ARE_NOT_ADMIN);
  } catch (err) {
    handleError(err as Error | GrammyError, ctx);
  }
};
