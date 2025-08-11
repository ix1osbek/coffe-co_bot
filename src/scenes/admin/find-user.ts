import { Scene } from "grammy-scenes";
import { MyContext } from "../../typings/interfaces/my-contex";
import { SCENES } from "../../typings/enums/scenes";
import { User } from "../../models/user.model";
import { backKeyboard } from "../../keybords/keybords";
import { KEYBOARDS } from "../../typings/enums/keyboards";
import { MESSAGES } from "../../typings/enums/messages";
import { userInlineKeyboard } from "../../keybords/inline-keybord";
import { formatCurrency, formatHTML } from "../../config/helpers";
import { handleError } from "../../middlewares/handle-error";
import { GrammyError } from "grammy";

export const findUserScene = new Scene<MyContext>(SCENES.FIND_USER);

findUserScene.label("askPhone");

findUserScene.step(async (ctx) => {
  await ctx.reply(MESSAGES.FIND_USER, {
    reply_markup: backKeyboard(),
  });
});

findUserScene.wait("phone").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, async (ctx) => {
    ctx.scene.enter(SCENES.ADMIN);
  });

  scene.on("message:text", async (ctx) => {
    try {
      const phone = formatHTML(ctx.message.text);

      const user = await User.findOne({ phone });

      if (!user) {
        await ctx.reply(MESSAGES.USER_NOT_FOUND, {
          reply_markup: backKeyboard(),
        });

        return;
      }

      ctx.scene.goto("askChangeCashback", { user });
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

findUserScene.label("askChangeCashback");

findUserScene.step(async (ctx) => {
  try {
    const user = ctx.scene.arg?.user;

    if (!user) {
      ctx.scene.goto("askPhone");

      return;
    }

    const text =
      `👤 <b>Ismi:</b> <a href="tg://user?id=${user.chat_id}">${user.name}</a>\n\n` +
      `📞 <b>Telefon raqami:</b> ${user.phone}\n\n` +
      `💰 <b>Keshbek hisobi:</b> ${formatCurrency(user.total_points)}`;

    await ctx.reply(text, {
      reply_markup: userInlineKeyboard(user),
      parse_mode: "HTML",
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

findUserScene.wait("change-cashback").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, async (ctx) => {
    ctx.scene.enter(SCENES.ADMIN);
  });

  scene.on("callback_query:data", async (ctx) => {
    try {
      ctx.answerCallbackQuery();

      const data = ctx.callbackQuery.data;

      const [action, userId] = data.split(":");

      if (action === KEYBOARDS.ADD_CASHBACK) {
        ctx.scene.enter(SCENES.UPDATE_CASHBACK, { action, userId });
      }

      if (action === KEYBOARDS.REMOVE_CASHBACK) {
        ctx.scene.enter(SCENES.UPDATE_CASHBACK, { action, userId });
      }
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});
