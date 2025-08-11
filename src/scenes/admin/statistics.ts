import { Scene } from "grammy-scenes";
import { MyContext } from "../../typings/interfaces/my-contex";
import { SCENES } from "../../typings/enums/scenes";
import { IUser, User } from "../../models/user.model";
import { GrammyError } from "grammy";
import { handleError } from "../../middlewares/handle-error";

export const statisticsScene = new Scene<MyContext>(SCENES.STATISTICS);

statisticsScene.step(async (ctx) => {
  try {
    const waitMessage = await ctx.reply("Kutib turing... ⏳");

    const users = await User.find();

    let activeUsers = 0;
    let inActiveUsers = 0;

    const blockedUserIds: string[] = [];

    const checks = users.map(async (user: IUser) => {
      try {
        await ctx.api.sendChatAction(user.chat_id, "typing");
        activeUsers++;
      } catch (error) {
        if (error instanceof GrammyError && error.error_code === 403) {
          blockedUserIds.push(user._id.toString());
          inActiveUsers++;
        } else {
          handleError(error as Error | GrammyError, ctx);
        }
      }
    });

    await Promise.all(checks);

    if (blockedUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: blockedUserIds } },
        { $set: { is_active: false } }
      );
    }

    await ctx.reply(
      `<b>📊 Barcha foydalanuvchilar:</b> ${users.length} ta\n\n` +
        `<b>🟢 Aktiv bo'lgan:</b> ${activeUsers} ta\n\n` +
        `<b>🔴 Aktiv bo'lmagan:</b> ${inActiveUsers} ta`,
      { parse_mode: "HTML" }
    );

    await ctx.api.deleteMessage(waitMessage.chat.id, waitMessage.message_id);

    ctx.scene.enter(SCENES.ADMIN, { silent: true });
  } catch (error) {
    handleError(error as Error | GrammyError, ctx);
  }
});
