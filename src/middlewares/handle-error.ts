import { GrammyError } from "grammy";
import { bot } from "../core/bot";
import { MyContext } from "../typings/interfaces/my-contex";
import { User } from "../models/user.model";
import { formatHTML } from "../config/helpers";
import { BOT_TOKEN, ERROR_CHANNELID } from "../config/environments";
import { SCENES } from "../typings/enums/scenes";

export const handleError = async (
  error: Error | GrammyError,
  ctx: MyContext
) => {
  if (error instanceof GrammyError && error.error_code === 403) {
    await User.updateOne(
      { chat_id: error.payload.chat_id },
      { $set: { is_active: false } }
    );

    return;
  }

  const formattedDate = new Date().toLocaleDateString("uz");
  const formattedTime = new Date().toLocaleTimeString("uz");

  const errorMessage =
    `` +
    `🚨 <b>UNEXPECTED ERROR FROM @${bot.botInfo.username}</b>

📅 <b>Date:</b> ${formattedDate}
⏰ <b>Time:</b> ${formattedTime}

❌ <b>Error Details:</b>
• <b>Message:</b> <pre><code class="language-bash">${formatHTML(
      error.message
    )}</code></pre>
• <b>Type:</b> <pre><code class="language-bash">${error.name}</code></pre>

👤 <b>User Data:</b>
${
  ctx.session.user
    ? `<pre><code class="language-json">${JSON.stringify(
        ctx.session.user,
        null,
        2
      )}</code></pre>`
    : "<i>No user data available</i>"
}

👥 <b>Chat Data:</b>
${
  ctx.chat
    ? `<pre><code class="language-json">${JSON.stringify(
        ctx.chat,
        null,
        2
      )}</code></pre>`
    : "<i>No chat data available</i>"
}

📝 <b>Message:</b>
${
  ctx.message
    ? `<pre><code class="language-json">${JSON.stringify(
        ctx.message,
        null,
        2
      )}</code></pre>`
    : "<i>No message data available</i>"
}

🎛 <b>Callback Query:</b>
${
  ctx.callbackQuery
    ? `<pre><code class="language-json">${JSON.stringify(
        ctx.callbackQuery.data,
        null,
        2
      )}</code></pre>`
    : "<i>No callback query data available</i>"
}

🔄 <b>Reply:</b>
${
  ctx.reply
    ? `<pre><code class="language-json">${JSON.stringify(
        ctx.reply,
        null,
        2
      )}</code></pre>`
    : "<i>No reply data available</i>"
}

🔄 <b>Session Data:</b>
<pre><code class="language-json">${JSON.stringify(
      ctx.session,
      null,
      2
    )}</code></pre>

⚡️ <i>Error has been automatically logged</i>`;

  // Send error to Telegram if bot token exists
  if (BOT_TOKEN && ERROR_CHANNELID) {
    try {
      await bot.api.sendMessage(ERROR_CHANNELID, errorMessage, {
        parse_mode: "HTML",
      });
    } catch (sendError: any) {
      await bot.api.sendMessage(
        ERROR_CHANNELID,
        `<b>Error sending error to Telegram:</b>\n<pre><code class="language-bash">${sendError}</code></pre>`,
        { parse_mode: "HTML" }
      );
      console.error("Error sending error to Telegram:", sendError);
    }
  }

  // Log error to console
  console.error("Error:", error);
  return ctx.scenes.enter(SCENES.MAIN, { back: true });
};
