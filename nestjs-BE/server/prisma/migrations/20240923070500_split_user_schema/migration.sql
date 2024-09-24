-- CreateTable
CREATE TABLE `KakaoUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `userUuid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `KakaoUser_email_key`(`email`),
    UNIQUE INDEX `KakaoUser_userUuid_key`(`userUuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KakaoUser` ADD CONSTRAINT `KakaoUser_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- InsertData
INSERT INTO `KakaoUser` (`email`, `userUuid`) SELECT `email`, `uuid` FROM `User` WHERE `provider` = 'kakao';

-- DropIndex
DROP INDEX `User_email_provider_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `email`,
    DROP COLUMN `provider`;

-- AlterTable
ALTER TABLE `User` MODIFY `uuid` varchar(36);
