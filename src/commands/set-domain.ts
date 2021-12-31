import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { getUser } from "../utils/getKutt";

const prisma = new PrismaClient();
//Add setDomain commands
const setDomain = () => {
  bot.hears(/\/domain_(.+)/, async (ctx) => {
    const rawDomain = ctx.match[1];
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from.id },
      select: { kuttAPIKey: true },
    });
    if (!user || !user.kuttAPIKey) {
      return ctx.editMessageText(
        "You have no API Key, please set your api key by pasting it in the chat",
      );
    }

    const kuttUser = await getUser(user.kuttAPIKey);
    let match = false;
    let domainList = "Your domains:\n";
    kuttUser.domains.forEach((domain) => {
      if (domain.address == rawDomain) {
        match = true;
      }
      domainList += `${domain.address}\n`;
    });
    if (match) {
      await prisma.user.update({
        where: { telegramId: ctx.from.id },
        data: { domain: rawDomain },
      });
      return ctx.reply("Updated your domain to " + rawDomain);
    } else {
      return ctx.reply(
        "Domain not in the list of domains\n" +
          domainList +
          "\nMake sure you have set up your domain at https://kutt.it/settings before setting the domain into this bot",
      );
    }
  });
};

export default setDomain;
