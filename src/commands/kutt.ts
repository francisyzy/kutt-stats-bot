import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { Message } from "typegram";
import { Markup } from "telegraf";

const prisma = new PrismaClient();
//Add kutt commands
const kutt = () => {
  // bot.hears(/\/api_(.+)/, async (ctx) => {
  //   let kutt: string;
  //   if (ctx.message.chat.type === "private") {
  //     kutt = ctx.match[1];
  //   } else {
  //     if (ctx.match[1].indexOf("@") !== -1) {
  //       kutt = ctx.match[1].split("@")[0];
  //     } else {
  //       kutt = ctx.match[1];
  //     }
  //   }
  // });
  bot.on("message", async (ctx) => {
    const unverifiedAPIKey = `${
      (ctx.message as Message.TextMessage).text
    }`;
    ctx.reply(
      "Is this your API Key? " + unverifiedAPIKey,
      Markup.inlineKeyboard([
        Markup.button.callback("Yes", unverifiedAPIKey),
        Markup.button.callback("No", "NO"),
      ]),
    );
  });
  bot.action(/.+/, async (ctx) => {
    const kutt = ctx.match[0];
    //exit condition
    if (kutt === "NO") {
      return await ctx.editMessageText(
        "Ok, send me your API Key again if you need to set it",
      );
    }
    await prisma.user.update({
      where: { telegramId: ctx.from!.id },
      data: { kuttAPIKey: kutt },
    });
    await ctx.editMessageText("Updated your API Key");
  });
};

export default kutt;
