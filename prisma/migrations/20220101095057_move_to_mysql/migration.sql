-- CreateTable
CREATE TABLE `User` (
    `telegramId` INTEGER NOT NULL,
    `kuttAPIKey` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `domain` VARCHAR(191) NOT NULL DEFAULT 'kutt.it',
    `urlCache` VARCHAR(191) NULL,
    `customCache` VARCHAR(191) NULL,

    PRIMARY KEY (`telegramId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
