import { Scene } from "grammy-scenes";
import { MyContext } from "../../typings/interfaces/my-contex";
import { SCENES } from "../../typings/enums/scenes";
import { User } from "../../models/user.model";
import { MESSAGES } from "../../typings/enums/messages";
import { backInlineKeyboard } from "../../keybords/inline-keybord";
import { KEYBOARDS } from "../../typings/enums/keyboards";
import loyverseService from "../../services/loyverse.service";
import { IUpdateCashbackSession } from "../../typings/interfaces/update-cashback-session";
import { handleError } from "../../middlewares/handle-error";
import { GrammyError } from "grammy";

export const updateCashbackScene = new Scene<MyContext, IUpdateCashbackSession>(
  SCENES.UPDATE_CASHBACK
);

updateCashbackScene.step(async (ctx) => {
  try {
    const { action, userId } = ctx.scene.arg;

    const user = await User.findById(userId);

    if (!user) {
      await ctx.reply(MESSAGES.USER_NOT_FOUND, {
        reply_markup: backInlineKeyboard(),
      });

      ctx.scene.enter(SCENES.FIND_USER);

      return;
    }

    ctx.scene.session = { user, action };

    let text = "";

    if (action === KEYBOARDS.ADD_CASHBACK) {
      text = MESSAGES.ADD_CASHBACK;
    }

    if (action === KEYBOARDS.REMOVE_CASHBACK) {
      text = MESSAGES.REMOVE_CASHBACK;
    }

    await ctx.editMessageText(text, {
      reply_markup: backInlineKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

updateCashbackScene.wait("cashback").setup((scene) => {
  scene.callbackQuery(KEYBOARDS.BACK, async (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.enter(SCENES.FIND_USER);
  });

  scene.on("message:text", async (ctx) => {
    try {
      const cashback = +ctx.message.text;

      if (isNaN(cashback)) {
        await ctx.reply(MESSAGES.MUST_BE_NUMBER, {
          reply_markup: backInlineKeyboard(),
        });

        return;
      }

      const { user, action } = ctx.scene.session;

      if (!user) {
        await ctx.reply(MESSAGES.USER_NOT_FOUND, {
          reply_markup: backInlineKeyboard(),
        });

        ctx.scene.enter(SCENES.FIND_USER);

        return;
      }

      if (
        action === KEYBOARDS.REMOVE_CASHBACK &&
        cashback > user.total_points
      ) {
        await ctx.reply(MESSAGES.NOT_ENOUGH_POINTS, {
          reply_markup: backInlineKeyboard(),
        });

        return;
      }

      let totalPoints = 0;

      if (action === KEYBOARDS.ADD_CASHBACK) {
        totalPoints = user.total_points + cashback;
      }

      if (action === KEYBOARDS.REMOVE_CASHBACK) {
        totalPoints = user.total_points - cashback;
      }

      await loyverseService.upsertCustomer({
        id: user.customer_id,
        name: user.name,
        phone_number: user.phone,
        total_points: totalPoints,
      });

      await ctx.reply(MESSAGES.SUCCESS_UPDATING_CASHBACK);

      ctx.scene.enter(SCENES.FIND_USER);
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);

      await ctx.reply(MESSAGES.ERROR_UPDATING_CASHBACK);
    }
  });
});
