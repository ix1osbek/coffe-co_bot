import { Scene } from "grammy-scenes";
import { MyContext } from "../typings/interfaces/my-contex";
import { SCENES } from "../typings/enums/scenes";
import { mainKeyboard } from "../keybords/keybords";
import { KEYBOARDS } from "../typings/enums/keyboards";
import { User } from "../models/user.model";
import { MESSAGES } from "../typings/enums/messages";
import { auth } from "../middlewares/auth.middleware";
import { formatCurrency } from "../config/helpers";
import { isAdmin } from "../middlewares/is-admin.middleware";
import { handleError } from "../middlewares/handle-error";
import { GrammyError } from "grammy";

export const mainScene = new Scene<MyContext>(SCENES.MAIN);

mainScene.step(async (ctx) => {
  try {
    if (ctx.scene.arg?.back) {
      await ctx.reply(MESSAGES.MENU, {
        reply_markup: mainKeyboard(),
      });

      return;
    }

    await ctx.reply(MESSAGES.START, {
      reply_markup: mainKeyboard(),
      parse_mode: "HTML",
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

mainScene.wait("main").setup((scene) => {
  scene.use(auth);

  scene.command("start", (ctx) => ctx.scene.enter(SCENES.MAIN));
  scene.command("admin", isAdmin, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.hears(KEYBOARDS.PROFILE, async (ctx) => {
    try {
      const user = await User.findOne({
        _id: ctx.session.user._id,
      });

      if (!user) {
        ctx.scene.enter(SCENES.AUTH);

        return;
      }

      const text =
        `👤 <b>Ismingiz:</b> ${user.name}\n\n` +
        `📞 <b>Telefon raqamingiz:</b> ${user.phone}\n\n` +
        `💰 <b>Keshbek hisobingiz:</b> ${formatCurrency(user.total_points)}`;

      await ctx.reply(text, { parse_mode: "HTML" });
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });

  scene.hears(KEYBOARDS.ABOUT_US, async (ctx) => {
    await ctx.reply(MESSAGES.ABOUT_US, { parse_mode: "HTML" });
  });

  scene.hears(KEYBOARDS.SEND_FEEDBACK, async (ctx) =>
    ctx.scene.enter(SCENES.SUBMIT_FEEDBACK)
  );
});
