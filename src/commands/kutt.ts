import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { Message, InlineKeyboardButton } from "typegram";
import { Markup } from "telegraf";
import {
  checkAPIKey,
  createLink,
  getRawList,
  getStats,
} from "../utils/getKutt";
import { formatStats } from "../utils/messageHandler";
import config from "../config";

const prisma = new PrismaClient();
//Add kutt commands
const kutt = () => {
  bot.hears(/\/stats_(.+)/, async (ctx) => {
    const uuid = ctx.match[1].replace(/_/g, "-");
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id },
      select: { kuttAPIKey: true },
    });
    if (!user || !user.kuttAPIKey) {
      return ctx.reply(
        "You have no API Key, please set your api key by pasting it in the chat",
      );
    }

    const rawStats = await getStats(user.kuttAPIKey, uuid);
    return ctx.reply(formatStats(rawStats), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  });

  bot.action(/.+/, async (ctx) => {
    const match = ctx.match[0];
    //exit condition
    if (match === "NO") {
      ctx.answerCbQuery("Discarding API key").catch((err) => {
        console.log(err);
      });
      return await ctx.editMessageText(
        "Ok, send me your API Key again if you need to set it",
      );
    } else if (match === "ÜNO") {
      ctx.answerCbQuery("Not creating URL").catch((err) => {
        console.log(err);
      });
      ctx.editMessageText("Refreshing, please wait…");
      await prisma.user.update({
        where: { telegramId: ctx.from!.id },
        data: { urlCache: null },
      });
      return await ctx.editMessageText(
        "Ok, will not create a short url",
      );
    } else if (match[0] === "§") {
      ctx.answerCbQuery("Checking API key").catch((err) => {
        console.log(err);
      });
      ctx.editMessageText("Validating API key, please wait…");
      const apiKey = match.replace("§", "");
      if (await checkAPIKey(apiKey)) {
        await prisma.user.update({
          where: { telegramId: ctx.from!.id },
          data: {
            kuttAPIKey: apiKey,
            urlCache: null,
            domain: "kutt.it",
          },
        });
        return await ctx.editMessageText(
          `Your API Key has been updated to <code>${apiKey}</code>`,
          { parse_mode: "HTML" },
        );
      } else {
        return await ctx.editMessageText(
          `Your API Key <code>${apiKey}</code> is not valid. Please <a href="https://kutt.it/login">login</a>, get a <a href="https://kutt.it/settings">API Key</a> and enter it into the chat`,
          { parse_mode: "HTML" },
        );
      }
    } else if (match[0] === "Ü") {
      ctx.answerCbQuery("Creating link").catch((err) => {
        console.log(err);
      });
      ctx.editMessageText("Creating link, please wait…");
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from!.id },
        select: {
          urlCache: true,
          kuttAPIKey: true,
          domain: true,
          customCache: true,
        },
      });
      if (!user) {
        return ctx.editMessageText("/start to create an account");
      }
      const kuttAPIKey = user.kuttAPIKey || config.KUTT_API_TOKEN;
      if (!kuttAPIKey) {
        return ctx.editMessageText(
          "You have no API Key, please set your api key by pasting it in the chat",
        );
      }
      if (user.urlCache) {
        const shortData = await createLink(
          kuttAPIKey,
          user.domain,
          user.urlCache,
          user.customCache || "",
        );
        await prisma.user.update({
          where: { telegramId: ctx.from!.id },
          data: { urlCache: null, customCache: null },
        });
        if (shortData.id === "error") {
          return ctx.editMessageText(
            `An error has occured <code>${shortData.address}</code>`,
            { parse_mode: "HTML" },
          );
        }
        let returnString = `Ok, I have shortened your url\n${user.urlCache} => ${shortData.link}`;
        if (user.kuttAPIKey) {
          returnString += `\n\n/stats_${shortData.id.replace(
            /-/g,
            "_",
          )}`;
        }
        return ctx.editMessageText(returnString, {
          disable_web_page_preview: true,
        });
      } else {
        return ctx.editMessageText(
          "An error occured, please try again",
        );
      }
    } else if (match[0] === "©") {
      ctx.answerCbQuery("Setting up custom url").catch((err) => {
        console.log(err);
      });
      ctx.editMessageText("Refreshing, please wait…");
      await prisma.user.update({
        where: { telegramId: ctx.from!.id },
        data: { customCache: "©" },
      });
      return ctx.editMessageText("Send custom URL");
    } else {
      ctx.answerCbQuery("Getting information").catch((err) => {
        console.log(err);
      });
      ctx.editMessageText("Refreshing, please wait…");
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from!.id },
        select: { kuttAPIKey: true },
      });
      if (!user || !user.kuttAPIKey) {
        return ctx.editMessageText(
          "You have no API Key, please set your api key by pasting it in the chat",
        );
      }

      if (match[0] === "¶") {
        const uuid = match.replace("¶", "");
        const rawStats = await getStats(user.kuttAPIKey, uuid);

        await ctx.editMessageText(formatStats(rawStats), {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } else if (match[0] === "«") {
        const skip = Number(match.replace("«", ""));
        const rawList = await getRawList(
          user.kuttAPIKey,
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
        const skip = Number(match.replace("»", ""));
        const rawList = await getRawList(
          user.kuttAPIKey,
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
    }
  });

  bot.command("list", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id },
      select: { kuttAPIKey: true },
    });
    if (!user || !user.kuttAPIKey) {
      return ctx.reply(
        "You have no API Key, please set your api key by pasting it in the chat",
      );
    }

    const rawList = await getRawList(user.kuttAPIKey, 10, 0);

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
      "Your lastest 10 links",
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
    const incomingString = `${
      (ctx.message as Message.TextMessage).text
    }`;
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from!.id },
      select: { kuttAPIKey: true, customCache: true, urlCache: true },
    });
    if (user?.customCache && user?.customCache.indexOf("©") !== -1) {
      const custom = incomingString.replace(/ /g, "-");
      await prisma.user.update({
        where: { telegramId: ctx.from.id },
        data: { customCache: custom },
      });
      let returnString = `Want to shorten this URL? <code>${user?.urlCache}</code>`;
      returnString += `\nCustom URL: ${custom}`;
      if (!user || !user.kuttAPIKey) {
        returnString +=
          "\n<i>You have no API Key, you will not be able to track stats for your link</i>";
      }
      ctx.replyWithHTML(
        returnString,
        Markup.inlineKeyboard([
          Markup.button.callback("Yes", "Ü"),
          Markup.button.callback("No", "ÜNO"),
          Markup.button.callback("Set custom URL", "©"),
        ]),
      );
    } else if (stringIsAValidUrl(incomingString)) {
      //https://github.com/telegraf/telegraf/issues/138 can only fit 64 byte of data
      await prisma.user.update({
        where: { telegramId: ctx.from.id },
        data: { urlCache: incomingString },
      });
      let returnString = `Want to shorten this URL? <code>${incomingString}</code>`;
      if (!user || !user.kuttAPIKey) {
        returnString +=
          "\n<i>You have no API Key, you will not be able to track stats for your link</i>";
      }
      ctx.replyWithHTML(
        returnString,
        Markup.inlineKeyboard([
          Markup.button.callback("Yes", "Ü"),
          Markup.button.callback("No", "ÜNO"),
          Markup.button.callback("Set custom URL", "©"),
        ]),
      );
    } else if (!user?.kuttAPIKey) {
      ctx.replyWithHTML(
        `Is this your API Key? <code>${incomingString}</code>`,
        Markup.inlineKeyboard([
          Markup.button.callback("Yes", "§" + incomingString),
          Markup.button.callback("No", "NO"),
        ]),
      );
    } else {
      ctx.reply("/help for more info");
    }
  });
};

const URL = require("url").URL;
const stringIsAValidUrl = (s: string) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

export default kutt;
