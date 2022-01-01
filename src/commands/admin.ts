import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import config from "../config";

const prisma = new PrismaClient();

//admin commands
const admin = () => {
  bot.command("/users", async (ctx) => {
    if (!checkAdmin(ctx.chat.id)) {
      return;
    }
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: subDays(new Date(), 7) } },
    });
    const activeUsers = await prisma.user.count({
      where: { updatedAt: { gte: subDays(new Date(), 7) } },
    });
    const ghostUsers = await prisma.user.count({
      where: {
        kuttAPIKey: null,
      },
    });
    const totalUsers = await prisma.user.count({});
    return ctx.replyWithHTML(`
<b>totalUsers:</b>${totalUsers}
<b>newUsers:</b>${newUsers}
<b>activeUsers:</b>${activeUsers}
<b>ghostUsers:</b>${ghostUsers}
`);
  });
};

function checkAdmin(telegramId: number): boolean {
  return telegramId === config.ADMIN_TELEGRAM_ID;
}

export default admin;
