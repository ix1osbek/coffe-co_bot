import { Scene } from "grammy-scenes";
import { MyContext } from "../../typings/interfaces/my-contex";
import { SCENES } from "../../typings/enums/scenes";
import { adminKeyboard } from "../../keybords/keybords";
import { isAdmin } from "../../middlewares/is-admin.middleware";
import { KEYBOARDS } from "../../typings/enums/keyboards";

export const adminScene = new Scene<MyContext>(SCENES.ADMIN);

adminScene.step(async (ctx) => {
  if (ctx.scene.arg?.silent) return;

  await ctx.reply("Admin paneliga xush kelibsiz!", {
    reply_markup: adminKeyboard(),
  });
});

adminScene.wait("menu").setup((scene) => {
  scene.command("start", (ctx) => ctx.scene.enter(SCENES.MAIN));

  scene.use(isAdmin);

  scene.command("admin", (ctx) => ctx.scene.enter(SCENES.ADMIN));

  scene.hears(KEYBOARDS.STATISTICS, async (ctx) => {
    ctx.scene.enter(SCENES.STATISTICS);
  });

  scene.hears(KEYBOARDS.FIND_USER, async (ctx) =>
    ctx.scene.enter(SCENES.FIND_USER)
  );

  scene.hears(KEYBOARDS.NEW_MESSAGE, async (ctx) =>
    ctx.scene.enter(SCENES.NEW_MESSAGE)
  );
});
