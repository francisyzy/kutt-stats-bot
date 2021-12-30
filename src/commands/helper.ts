import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { toEscapeHTMLMsg } from "../utils/messageHandler";
import { getBotCommands } from "../utils/botCommands";

const prisma = new PrismaClient();
//General helper commands
const helper = () => {
  //Deep linking https://github.com/telegraf/telegraf/issues/504#issuecomment-420025006
  bot.hears(/^\/start[ =](.+)$/, async (ctx) => {
    bot.telegram.setMyCommands(getBotCommands());
    await prisma.user.upsert({
      where: { telegramId: ctx.from!.id },
      update: { name: ctx.from.first_name, kuttAPIKey: ctx.match[1] },
      create: {
        telegramId: ctx.from.id,
        name: ctx.from.first_name,
        kuttAPIKey: ctx.match[1],
      },
    });
    return ctx.reply(
      "Welcome to kutt stats bot. Your API Key has been added!",
    );
  });
  //All bots start with /start
  bot.start(async (ctx) => {
    bot.telegram.setMyCommands(getBotCommands());
    await prisma.user.upsert({
      where: { telegramId: ctx.from!.id },
      update: { name: ctx.from.first_name },
      create: { telegramId: ctx.from.id, name: ctx.from.first_name },
    });
    return ctx.reply("Welcome to kutt stats bot");
  });

  bot.command("account", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from.id },
    });
    if (user) {
      return ctx.replyWithHTML(
        `<b>Name</b>: ${toEscapeHTMLMsg(
          user.name,
        )} \n<b>API Key.</b>: ${user.kuttAPIKey}`,
      );
    } else {
      return ctx.reply("Please /start to create an account");
    }
  });
  bot.help((ctx) => ctx.reply("Help message"));
};

export default helper;
