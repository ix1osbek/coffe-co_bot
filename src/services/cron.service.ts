import * as cron from "cron";
import loyverseService from "./loyverse.service";
import { User } from "../models/user.model";
import { formatCurrency } from "../config/helpers";
import { bot } from "../core/bot";
import { GrammyError } from "grammy";

class CronService {
  constructor() {}

  private async callback() {
    const users = await User.find({});

    let updatedUsers = 0;

    const promises = users.map(async (user) => {
      const customer = await loyverseService.getCustomer(user.customer_id);

      if (!customer) {
        await User.findByIdAndDelete(user._id);

        return;
      }

      if (customer.total_points === user.total_points) return;

      user.total_points = customer.total_points;

      await user.save();

      try {
        const text =
          `<b>💸 Keshbek hisobingiz yangilandi!</b>\n\n` +
          `<b>💰 Yangi hisob:</b> ${formatCurrency(user.total_points)}`;

        await bot.api.sendMessage(user.chat_id, text, {
          parse_mode: "HTML",
        });

        updatedUsers++;
      } catch (error) {
        if (error instanceof GrammyError && error.error_code === 403) {
          await User.updateOne(
            { chat_id: user.chat_id },
            { $set: { is_active: false } }
          );
        }
      }
    });

    await Promise.all(promises);

    console.log(
      `✅ Updated ${updatedUsers} users`,
      new Date().toLocaleString()
    );
  }

  init() {
    new cron.CronJob("* * * * *", this.callback, null, true, "Asia/Tashkent");
  }
}

export default new CronService();
