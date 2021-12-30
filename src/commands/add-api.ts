import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { Message } from "typegram";
import { Markup } from "telegraf";

const prisma = new PrismaClient();
//Add addAPIKey commands
const addAPIKey = () => {
  // bot.hears(/\/api_(.+)/, async (ctx) => {
  //   let addAPIKey: string;
  //   if (ctx.message.chat.type === "private") {
  //     addAPIKey = ctx.match[1];
  //   } else {
  //     if (ctx.match[1].indexOf("@") !== -1) {
  //       addAPIKey = ctx.match[1].split("@")[0];
  //     } else {
  //       addAPIKey = ctx.match[1];
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
    const addAPIKey = ctx.match[0];
    //exit condition
    if (addAPIKey === "NO") {
      return await ctx.editMessageText(
        "Ok, send me your API Key again if you need to set it",
      );
    }
    console.log(ctx.from!.id);
    await prisma.user.update({
      where: { telegramId: ctx.from!.id },
      data: { kuttAPIKey: addAPIKey },
    });
    await ctx.editMessageText("Updated your API Key");
  });
};

export default addAPIKey;
