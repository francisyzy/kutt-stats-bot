import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { Message, InlineKeyboardButton } from "typegram";
import { Markup } from "telegraf";
import { getRawList, getStats } from "../utils/getKutt";
import { formatStats } from "../utils/messageHandler";

const prisma = new PrismaClient();
//Add kutt commands
const kutt = () => {
  bot.hears(/\/stats_(.+)/, async (ctx) => {
    const uuid = ctx.match[1].replace(/_/g, "-");
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id! },
      select: { kuttAPIKey: true },
    });
    const rawStats = await getStats(user!.kuttAPIKey!, uuid);
    return ctx.reply(formatStats(rawStats), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  });

  bot.action(/.+/, async (ctx) => {
    const match = ctx.match[0];
    //exit condition
    if (match === "NO") {
      return await ctx.editMessageText(
        "Ok, send me your API Key again if you need to set it",
      );
    } else if (match[0] === "§") {
      const apiKey = match.replace("§", "");
      await prisma.user.update({
        where: { telegramId: ctx.from!.id },
        data: { kuttAPIKey: apiKey },
      });
      await ctx.editMessageText(
        `Your API Key has been updated to ${apiKey}`,
        { parse_mode: "HTML" },
      );
    } else if (match[0] === "¶") {
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from!.id! },
        select: { kuttAPIKey: true },
      });
      const uuid = match.replace("¶", "");
      const rawStats = await getStats(user!.kuttAPIKey!, uuid);

      await ctx.editMessageText(formatStats(rawStats), {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } else if (match[0] === "«") {
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from!.id! },
        select: { kuttAPIKey: true },
      });
      const skip = Number(match.replace("«", ""));
      const rawList = await getRawList(
        user!.kuttAPIKey!,
        10 - skip,
        skip - 10,
      );

      let btnList: (InlineKeyboardButton & {
        hide?: boolean | undefined;
      })[] = [];

      rawList.data.forEach((data) => {
        btnList.push(
          Markup.button.callback(data.address, "¶" + data.id),
        );
      });
      if (rawList.skip !== 0) {
        btnList.push(
          Markup.button.callback(
            "« Previous Page «",
            "«" + rawList.skip,
          ),
        );
      }
      if (rawList.total > rawList.limit) {
        btnList.push(
          Markup.button.callback(
            "» Next page »",
            "»" + rawList.limit,
          ),
        );
      }

      await ctx.editMessageText(
        "Previous Page",
        Markup.inlineKeyboard(btnList, {
          //set up custom keyboard wraps for two columns
          wrap: (btn, index, currentRow) => {
            if (currentRow.length === 2) {
              return true;
            } else {
              return false;
            }
          },
        }),
      );
    } else if (match[0] === "»") {
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from!.id! },
        select: { kuttAPIKey: true },
      });
      const skip = Number(match.replace("»", ""));
      const rawList = await getRawList(
        user!.kuttAPIKey!,
        skip + 10,
        skip,
      );

      let btnList: (InlineKeyboardButton & {
        hide?: boolean | undefined;
      })[] = [];

      rawList.data.forEach((data) => {
        btnList.push(
          Markup.button.callback(data.address, "¶" + data.id),
        );
      });
      if (rawList.skip !== 0) {
        btnList.push(
          Markup.button.callback(
            "« Previous Page «",
            "«" + rawList.skip,
          ),
        );
      }
      if (rawList.total > rawList.limit) {
        btnList.push(
          Markup.button.callback(
            "» Next page »",
            "»" + rawList.limit,
          ),
        );
      }

      await ctx.editMessageText(
        "Next Page",
        Markup.inlineKeyboard(btnList, {
          //set up custom keyboard wraps for two columns
          wrap: (btn, index, currentRow) => {
            if (currentRow.length === 2) {
              return true;
            } else {
              return false;
            }
          },
        }),
      );
    }
  });

  bot.command("list", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id },
      select: { kuttAPIKey: true },
    });

    const rawList = await getRawList(user!.kuttAPIKey!, 10, 0);

    let btnList: (InlineKeyboardButton & {
      hide?: boolean | undefined;
    })[] = [];

    rawList.data.forEach((data) => {
      btnList.push(
        Markup.button.callback(data.address, "¶" + data.id),
      );
    });

    if (rawList.skip !== 0) {
      btnList.push(
        Markup.button.callback(
          "« Previous Page «",
          "«" + rawList.skip,
        ),
      );
    }
    if (rawList.total > rawList.limit) {
      btnList.push(
        Markup.button.callback("» Next page »", "»" + rawList.limit),
      );
    }

    return ctx.reply(
      "Your list of links",
      Markup.inlineKeyboard(btnList, {
        //set up custom keyboard wraps for two columns
        wrap: (btn, index, currentRow) => {
          if (currentRow.length === 2) {
            return true;
          } else {
            return false;
          }
        },
      }),
    );
  });

  bot.on("message", async (ctx) => {
    const unverifiedAPIKey = `${
      (ctx.message as Message.TextMessage).text
    }`;
    ctx.replyWithHTML(
      `Is this your API Key? <pre>${unverifiedAPIKey}</pre>`,
      Markup.inlineKeyboard([
        Markup.button.callback("Yes", "§" + unverifiedAPIKey),
        Markup.button.callback("No", "NO"),
      ]),
    );
  });
};

export default kutt;
