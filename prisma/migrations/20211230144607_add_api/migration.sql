/*
  Warnings:

  - You are about to drop the column `phone_number` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone_number",
ADD COLUMN     "kuttAPIKey" TEXT;
