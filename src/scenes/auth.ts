import { Scene } from "grammy-scenes";
import { MyContext } from "../typings/interfaces/my-contex";
import { SCENES } from "../typings/enums/scenes";
import { MESSAGES } from "../typings/enums/messages";
import { AuthSession } from "../typings/interfaces/auth-session";
import { KEYBOARDS } from "../typings/enums/keyboards";
import { sendContactKeyboard } from "../keybords/keybords";
import { User } from "../models/user.model";
import loyverseService from "../services/loyverse.service";
import { handleError } from "../middlewares/handle-error";
import { GrammyError } from "grammy";
import { formatHTML } from "../config/helpers";

export const authScene = new Scene<MyContext, AuthSession>(SCENES.AUTH);

authScene.label("askName");

authScene.step(async (ctx) => {
    await ctx.reply(MESSAGES.ASK_FULL_NAME, {
        reply_markup: { remove_keyboard: true },
    });
});

authScene.wait("name").on("message:text", async (ctx) => {
    try {

        const text = ctx.message.text;

        if (text === "/start") {
            await ctx.reply(MESSAGES.ASK_FULL_NAME);
            return;
        }
        
        const name = formatHTML(text);

        ctx.scene.session = { name };

        ctx.scene.resume();
    } catch (error) {
        handleError(error as Error | GrammyError, ctx);
    }
});

authScene.label("askPhone");

authScene.step(async (ctx) => {
    await ctx.reply(MESSAGES.ASK_PHONE_NUMBER, {
        reply_markup: sendContactKeyboard(),
    });
});

authScene.wait("phone").setup((scene) => {
    scene.on("message:contact", async (ctx) => {
        const contact = ctx.message.contact;

        if (!contact.phone_number.startsWith("+")) {
            contact.phone_number = `+${contact.phone_number}`;
        }

        ctx.scene.session.phone = contact.phone_number;

        const { name, phone } = ctx.scene.session;

        const user = await User.findOne({ phone });

        if (user) {
            ctx.session.user = user;

            ctx.scene.enter(SCENES.MAIN);

            return;
        }

        try {
            const customer = await loyverseService.upsertCustomer({
                name: name || "",
                phone_number: phone,
                total_points: 0,
            });

            const newUser = await User.create({
                name,
                phone,
                chat_id: ctx.chat.id,
                username: ctx.chat.username,
                customer_id: customer.id,
            });

            ctx.session.user = newUser;

            ctx.scene.enter(SCENES.MAIN);
        } catch (error) {
            handleError(error as Error | GrammyError, ctx);

            await ctx.reply(MESSAGES.ERROR_CREATING_CUSTOMER);
        }
    });

    scene.hears(KEYBOARDS.BACK, async (ctx) => ctx.scene.goto("askName"));
});
