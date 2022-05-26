import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ping = () => {
  prisma.$connect;
  prisma.user.count;
  prisma.$disconnect;
};
export default ping;
