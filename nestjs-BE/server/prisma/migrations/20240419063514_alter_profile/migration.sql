/*
  Warnings:

  - You are about to drop the `PROFILE_TB` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PROFILE_SPACE_TB` DROP FOREIGN KEY `PROFILE_SPACE_TB_profile_uuid_fkey`;

-- DropForeignKey
ALTER TABLE `PROFILE_TB` DROP FOREIGN KEY `PROFILE_TB_user_id_fkey`;

-- DropTable
DROP TABLE `PROFILE_TB`;

-- CreateTable
CREATE TABLE `Profile` (
    `uuid` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(32) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `Profile_user_id_key`(`user_id`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROFILE_SPACE_TB` ADD CONSTRAINT `PROFILE_SPACE_TB_profile_uuid_fkey` FOREIGN KEY (`profile_uuid`) REFERENCES `Profile`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
