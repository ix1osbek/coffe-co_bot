import { GrammyError, NextFunction } from "grammy";
import { MyContext } from "../typings/interfaces/my-contex";
import { SCENES } from "../typings/enums/scenes";
import { User } from "../models/user.model";
import { MESSAGES } from "../typings/enums/messages";
import { handleError } from "./handle-error";

export const auth = async (ctx: MyContext, next: NextFunction) => {
  try {
    if (!ctx.from) {
      await ctx.reply(MESSAGES.MUST_USE_TELEGRAM);

      return;
    }

    // if (ctx.session.user) {
    //   next();

    //   return;
    // }

    const user = await User.findOne({ chat_id: ctx.from.id });

    if (user) {
      if (!user.is_active) {
        user.is_active = true;

        await user.save();

        ctx.session.user = user;

        next();

        return;
      }
      ctx.session.user = user;

      next();

      return;
    }

    ctx.scenes.enter(SCENES.AUTH);
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
};
