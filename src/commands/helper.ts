import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { toEscapeHTMLMsg } from "../utils/messageHandler";
import { getBotCommands } from "../utils/botCommands";
import { getHealth } from "../utils/getKutt";

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
    const user = await prisma.user.upsert({
      where: { telegramId: ctx.from!.id },
      update: { name: ctx.from.first_name },
      create: { telegramId: ctx.from.id, name: ctx.from.first_name },
    });
    return ctx.reply(
      `Welcome to kutt stats bot ${
        !user.kuttAPIKey
          ? ". You have yet to set your API key, please set it by sending it into the chat."
          : ". /help for more info"
      }`,
    );
  });

  bot.command("status", async (ctx) => {
    return ctx.reply(
      (await getHealth())
        ? "https://kutt.it/ is up"
        : "https://kutt.it/ is down",
    );
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
  bot.help(async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from.id },
    });
    let returnMessage =
      "Welcome to (<i>unofficial</i>) <a>Kutt.it</a> bot.\n";
    if (!user?.kuttAPIKey) {
      returnMessage += `<b>You have yet to add your API Key, <a href="https://kutt.it/login">get one here!</a></b>\n`;
    }
    returnMessage += "\n";
    getBotCommands().forEach((command) => {
      returnMessage += "/" + command.command + "\n";
      returnMessage += "<i>" + command.description + "</i>\n\n";
    });
    return ctx.replyWithHTML(returnMessage, {
      disable_web_page_preview: true,
    });
  });
};

export default helper;
