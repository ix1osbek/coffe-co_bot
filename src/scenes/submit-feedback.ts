import { Scene } from "grammy-scenes";
import { MyContext } from "../typings/interfaces/my-contex";
import { SCENES } from "../typings/enums/scenes";
import { MESSAGES } from "../typings/enums/messages";
import { backKeyboard } from "../keybords/keybords";
import { FEEDBACK_CHANNEL } from "../config/environments";
import { KEYBOARDS } from "../typings/enums/keyboards";
import { handleError } from "../middlewares/handle-error";
import { GrammyError } from "grammy";
import { formatHTML } from "../config/helpers";

export const submitFeedbackScene = new Scene<MyContext>(SCENES.SUBMIT_FEEDBACK);

submitFeedbackScene.step(async (ctx) => {
  await ctx.reply(MESSAGES.SUBMIT_FEEDBACK, {
    reply_markup: backKeyboard(),
    parse_mode: "HTML",
  });
});

submitFeedbackScene.wait("feedback").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) =>
    ctx.scene.enter(SCENES.MAIN, { back: true })
  );

  scene.on("message:text", async (ctx) => {
    try {
      const text =
        `<b>✍️ Yangi murojaat:</b> \n\n` +
        `<b>👤 Ism:</b> <a href="tg://user?id=${ctx.session.user.chat_id}">${ctx.session.user.name}</a>\n` +
        `<b>📞 Telefon:</b> ${ctx.session.user.phone}\n` +
        `<b>📝 Xabar:</b> \n\n${formatHTML(ctx.message.text)}`;

      await ctx.api.sendMessage(FEEDBACK_CHANNEL, text, {
        parse_mode: "HTML",
      });

      await ctx.reply("Murojaatingiz muvaffaqiyatli yuborildi. Tashakkur! 😊");
      return ctx.scene.enter(SCENES.MAIN, { back: true });
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);

      await ctx.reply(MESSAGES.ERROR_SUBMITTING_FEEDBACK);
    }
  });
});
