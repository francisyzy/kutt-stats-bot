import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { Markup } from "telegraf";
import config from "../config";

const prisma = new PrismaClient();
//Add invite commands
const invite = () => {
  bot.command("invite", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id },
      select: { kuttAPIKey: true },
    });
    if (user?.kuttAPIKey) {
      ctx
        .reply(
          "Forward the following message to invite people to use this bot with your API Key",
        )
        .then(() => {
          return ctx.replyWithHTML(
            `Hi, you have been invited to use @${config.BOT_USERNAME} <a href="https://t.me/${config.BOT_USERNAME}?start=${user.kuttAPIKey}">Press this or the button below to to start using the bot</a>`,
            Markup.inlineKeyboard([
              Markup.button.url(
                "Start",
                `https://t.me/${config.BOT_USERNAME}?start=${user.kuttAPIKey}`,
              ),
            ]),
          );
        });
    } else {
      return ctx.reply(
        `You have yet to set your API Key, you cannot invite others!`,
      );
    }
  });
};

export default invite;
