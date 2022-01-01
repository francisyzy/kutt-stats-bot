import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { toEscapeHTMLMsg } from "../utils/messageHandler";
import { getBotCommands } from "../utils/botCommands";
import { checkAPIKey, getHealth } from "../utils/getKutt";

const prisma = new PrismaClient();
//General helper commands
const helper = () => {
  //Deep linking https://github.com/telegraf/telegraf/issues/504#issuecomment-420025006
  bot.hears(/^\/start[ =](.+)$/, async (ctx) => {
    bot.telegram.setMyCommands(getBotCommands());
    const rawAPIKey = ctx.match[1];
    if (await checkAPIKey(rawAPIKey)) {
      await prisma.user.upsert({
        where: { telegramId: ctx.from!.id },
        update: {
          name: ctx.from.first_name,
          kuttAPIKey: rawAPIKey,
          domain: "kutt.it",
        },
        create: {
          telegramId: ctx.from.id,
          name: ctx.from.first_name,
          kuttAPIKey: rawAPIKey,
        },
      });
      return ctx.reply(
        "Welcome to kutt stats bot. Your API Key has been added!",
      );
    } else {
      await prisma.user.upsert({
        where: { telegramId: ctx.from!.id },
        update: { name: ctx.from.first_name },
        create: {
          telegramId: ctx.from.id,
          name: ctx.from.first_name,
        },
      });
      return ctx.replyWithHTML(
        `Welcome to kutt stats bot. The API Key is invalid. Please <a href="https://kutt.it/login">login</a>, get a <a href="https://kutt.it/settings">API Key</a> and enter it again`,
      );
    }
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
          ? ". You have yet to set your API key, please set it by sending it into the chat. /help to learn how to get an API Key"
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
      returnMessage += `<b>You have yet to add your API Key, Please <a href="https://kutt.it/login">login</a>, get a <a href="https://kutt.it/settings">API Key</a> and enter it into the chat</b>\n`;
    }
    returnMessage += "\n";
    getBotCommands().forEach((command) => {
      returnMessage += "/" + command.command + "\n";
      returnMessage += "<i>" + command.description + "</i>\n\n";
    });
    returnMessage += `<i>You can set your own custom domain by using this command <u>/domain_example.com</u> where example.com is a domain you have configured in the <a href="https://kutt.it/settings">Settings page</a></i>\n\n`;
    returnMessage += `<i>For bug reports, please create an issue at <a href="http://go.francisyzy.com/kutt-bot-issues">Github</a></i>\n\n`;
    return ctx.replyWithHTML(returnMessage, {
      disable_web_page_preview: true,
    });
  });
};

export default helper;
