import { session } from "grammy";
import { bot } from "./core/bot";
import { scenes } from "./scenes";
import { auth } from "./middlewares/auth.middleware";
import { SCENES } from "./typings/enums/scenes";
import { connectDB } from "./core/connect-db";
import { launch } from "./core/launch";
import cronService from "./services/cron.service";
import { isAdmin } from "./middlewares/is-admin.middleware";

bot.use(session({ initial: () => ({}) }));
bot.use(scenes.manager());
bot.use(scenes);

bot.use(auth);

bot.command("start", (ctx) => ctx.scenes.enter(SCENES.MAIN));
bot.command("admin", isAdmin, (ctx) => ctx.scenes.enter(SCENES.ADMIN));

launch(bot);
connectDB();

cronService.init();
