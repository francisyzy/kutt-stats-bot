import { PrismaClient } from "@prisma/client";
import config from "./config";

const prisma = new PrismaClient();

const ping = () => {
  prisma.$connect;
  prisma.user.count;
  prisma.user.update({
    where: { telegramId: config.ADMIN_TELEGRAM_ID },
    data: { updatedAt: new Date() },
  });
  prisma.$disconnect;
};
export default ping;
