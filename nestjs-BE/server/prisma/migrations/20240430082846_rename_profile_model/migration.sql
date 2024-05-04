-- DropForeignKey
ALTER TABLE `PROFILE_TB` DROP FOREIGN KEY `PROFILE_TB_user_id_fkey`;

-- RenameIndex
ALTER TABLE `PROFILE_TB` RENAME INDEX `PROFILE_TB_user_id_key` TO `Profile_user_id_key`;

-- RenameTable
ALTER TABLE `PROFILE_TB` RENAME `Profile`;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
