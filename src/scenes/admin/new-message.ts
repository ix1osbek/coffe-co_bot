import { Scene } from "grammy-scenes";
import { MyContext } from "../../typings/interfaces/my-contex";
import { SCENES } from "../../typings/enums/scenes";
import { NewMessageSession } from "../../typings/interfaces/new-message-session";
import { MESSAGES } from "../../typings/enums/messages";
import { backKeyboard } from "../../keybords/keybords";
import { KEYBOARDS } from "../../typings/enums/keyboards";
import { formatHTML } from "../../config/helpers";
import {
  askMediaTypeInlineKeyboard,
  askYesNoInlineKeyboard,
  backInlineKeyboard,
  backOrSkipInlineKeyboard,
} from "../../keybords/inline-keybord";
import { User } from "../../models/user.model";
import { handleError } from "../../middlewares/handle-error";
import { GrammyError } from "grammy";

export const newMessageScene = new Scene<MyContext, NewMessageSession>(
  SCENES.NEW_MESSAGE
);

newMessageScene.label("askMessage");

newMessageScene.step(async (ctx) => {
  try {
    if (ctx.scene.arg?.back) {
      await ctx.editMessageText(MESSAGES.MESSAGE_TEXT);

      return;
    }

    await ctx.reply(MESSAGES.MESSAGE_TEXT, {
      reply_markup: backKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

newMessageScene.wait("message-text").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.on("message:text", async (ctx) => {
    try {
      ctx.scene.session = { text: formatHTML(ctx.message.text) };

      ctx.scene.resume();
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

newMessageScene.label("askMediaType");

newMessageScene.step(async (ctx) => {
  try {
    if (ctx.scene.arg?.silent) {
      await ctx.editMessageText(MESSAGES.ASK_MEDIA, {
        reply_markup: askMediaTypeInlineKeyboard(),
      });

      return;
    }

    await ctx.reply(MESSAGES.ASK_MEDIA, {
      reply_markup: askMediaTypeInlineKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

newMessageScene.wait("media-type").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.SKIP, (ctx) => {
    ctx.answerCallbackQuery();

    delete ctx.scene.session.media;
    delete ctx.scene.session.media_type;

    ctx.scene.goto("askPointsFrom", { silent: true });
  });

  scene.callbackQuery(KEYBOARDS.PHOTO, (ctx) => {
    ctx.answerCallbackQuery();

    ctx.scene.goto("askPhoto");
  });

  scene.callbackQuery(KEYBOARDS.VIDEO, (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.goto("askVideo", { silent: true });
  });
});

newMessageScene.label("askPhoto");

newMessageScene.step(async (ctx) => {
  await ctx.editMessageText(MESSAGES.SEND_PHOTO, {
    reply_markup: backInlineKeyboard(),
  });
});

newMessageScene.wait("photo").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.BACK, (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.goto("askMediaType", { silent: true });
  });

  scene.on("message:photo", async (ctx) => {
    try {
      const photo = ctx.message.photo[0];

      if (!photo) {
        await ctx.reply(MESSAGES.PHOTO_NOT_FOUND);

        return;
      }

      ctx.scene.session.media = photo.file_id;
      ctx.scene.session.media_type = "photo";

      ctx.scene.goto("askPointsFrom");
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

newMessageScene.label("askVideo");

newMessageScene.step(async (ctx) => {
  await ctx.editMessageText(MESSAGES.SEND_VIDEO, {
    reply_markup: backInlineKeyboard(),
  });
});

newMessageScene.wait("video").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.BACK, (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.goto("askMediaType", { silent: true });
  });

  scene.on("message:video", async (ctx) => {
    try {
      const video = ctx.message.video;

      if (!video) {
        await ctx.reply(MESSAGES.VIDEO_NOT_FOUND);

        return;
      }

      ctx.scene.session.media = video.file_id;
      ctx.scene.session.media_type = "video";

      ctx.scene.goto("askPointsFrom");
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

newMessageScene.label("askPointsFrom");

newMessageScene.step(async (ctx) => {
  try {
    if (ctx.scene.arg?.silent) {
      await ctx.editMessageText(MESSAGES.POINTS_FROM, {
        reply_markup: backOrSkipInlineKeyboard(),
      });

      return;
    }

    await ctx.reply(MESSAGES.POINTS_FROM, {
      reply_markup: backOrSkipInlineKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

newMessageScene.wait("points-from").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.BACK, (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.goto("askMediaType", { silent: true });
  });

  scene.callbackQuery(KEYBOARDS.SKIP, (ctx) => {
    ctx.answerCallbackQuery();

    delete ctx.scene.session.points_from;

    ctx.scene.goto("askPointsTo", { silent: true });
  });

  scene.on("message:text", async (ctx) => {
    try {
      const pointsFrom = +ctx.message.text;

      if (isNaN(pointsFrom)) {
        await ctx.reply(MESSAGES.MUST_BE_NUMBER);

        return;
      }

      ctx.scene.session.points_from = pointsFrom;

      ctx.scene.resume();
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

newMessageScene.label("askPointsTo");

newMessageScene.step(async (ctx) => {
  try {
    if (ctx.scene.arg?.silent) {
      await ctx.editMessageText(MESSAGES.POINTS_TO, {
        reply_markup: backOrSkipInlineKeyboard(),
      });

      return;
    }

    await ctx.reply(MESSAGES.POINTS_TO, {
      reply_markup: backOrSkipInlineKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

newMessageScene.wait("points-to").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.BACK, (ctx) => {
    ctx.answerCallbackQuery();
    ctx.scene.goto("askPointsFrom", { silent: true });
  });

  scene.callbackQuery(KEYBOARDS.SKIP, (ctx) => {
    ctx.answerCallbackQuery();

    delete ctx.scene.session.points_to;

    ctx.scene.goto("askConfirm", { silent: true });
  });

  scene.on("message:text", async (ctx) => {
    try {
      const pointsTo = +ctx.message.text;

      if (isNaN(pointsTo)) {
        await ctx.reply(MESSAGES.MUST_BE_NUMBER);

        return;
      }

      ctx.scene.session.points_to = pointsTo;

      ctx.scene.resume();
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });
});

newMessageScene.label("askConfirm");

newMessageScene.step(async (ctx) => {
  const { text, media, media_type } = ctx.scene.session;

  if (!text) {
    ctx.scene.enter(SCENES.NEW_MESSAGE);
    return;
  }

  try {
    switch (media_type) {
      case "photo":
        if (!media) {
          await ctx.reply(MESSAGES.PHOTO_NOT_FOUND);
          return;
        }

        await ctx.replyWithPhoto(media, { caption: text });
        break;
      case "video":
        if (!media) {
          await ctx.reply(MESSAGES.VIDEO_NOT_FOUND);
          return;
        }
        await ctx.replyWithVideo(media, { caption: text });
        break;
      default:
        await ctx.reply(text);
        break;
    }

    await ctx.reply(MESSAGES.CONFIRM, {
      reply_markup: askYesNoInlineKeyboard(),
    });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});

newMessageScene.wait("confirm").setup((scene) => {
  scene.hears(KEYBOARDS.BACK, (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.callbackQuery(KEYBOARDS.YES, async (ctx) => {
    try {
      ctx.answerCallbackQuery();

      const { text, media, media_type, points_from, points_to } =
        ctx.scene.session;

      if (!text) {
        ctx.scene.enter(SCENES.NEW_MESSAGE);
        return;
      }

      const waitMessage = await ctx.reply(MESSAGES.WAIT);

      const query: { total_points?: { $gte?: number; $lte?: number } } = {};

      if (points_from && points_from > 0) {
        query.total_points = { $gte: points_from };
      }

      if (points_to && points_to > 0) {
        query.total_points = { ...query.total_points, $lte: points_to };
      }

      const users = await User.find(query);

      let sent = 0;

      const messages = users.map((user) => {
        switch (media_type) {
          case "photo":
            if (!media) {
              ctx.reply(MESSAGES.PHOTO_NOT_FOUND);
              return;
            }
            ctx.api.sendPhoto(user.chat_id, media, { caption: text });
            break;
          case "video":
            if (!media) {
              ctx.reply(MESSAGES.VIDEO_NOT_FOUND);
              return;
            }
            ctx.api.sendVideo(user.chat_id, media, { caption: text });
            break;
          default:
            ctx.api.sendMessage(user.chat_id, text);
            break;
        }

        sent++;
      });

      await Promise.all(messages);

      await ctx.reply(`Xabar ${sent} ta foydalanuvchiga yuborildi! ✅`);
      await ctx.deleteMessages([waitMessage.message_id]);
      ctx.scene.enter(SCENES.ADMIN, { back: true });
    } catch (error) {
      handleError(error as Error | GrammyError, ctx);
    }
  });

  scene.callbackQuery(KEYBOARDS.NO, (ctx) => {
    ctx.answerCallbackQuery();

    ctx.scene.session = {};

    ctx.scene.enter(SCENES.ADMIN, { back: true });
  });

  scene.callbackQuery(KEYBOARDS.BACK, (ctx) => {
    ctx.answerCallbackQuery();

    ctx.scene.goto("askPointsTo", { silent: true });
  });
});
