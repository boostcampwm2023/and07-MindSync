-- DropForeignKey
ALTER TABLE `INVITE_CODE_TB` DROP FOREIGN KEY `INVITE_CODE_TB_space_uuid_fkey`;

-- DropForeignKey
ALTER TABLE `PROFILE_SPACE_TB` DROP FOREIGN KEY `PROFILE_SPACE_TB_profile_uuid_fkey`;

-- DropForeignKey
ALTER TABLE `PROFILE_SPACE_TB` DROP FOREIGN KEY `PROFILE_SPACE_TB_space_uuid_fkey`;

-- RenameIndex
ALTER TABLE `PROFILE_SPACE_TB` RENAME INDEX `PROFILE_SPACE_TB_space_uuid_profile_uuid_key` TO `Profile_space_space_uuid_profile_uuid_key`;

-- RenameTable
ALTER TABLE `PROFILE_SPACE_TB` RENAME `Profile_space`;

-- RenameTable
ALTER TABLE `SPACE_TB` RENAME `Space`;

-- AddForeignKey
ALTER TABLE `Profile_space` ADD CONSTRAINT `Profile_space_space_uuid_fkey` FOREIGN KEY (`space_uuid`) REFERENCES `Space`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile_space` ADD CONSTRAINT `Profile_space_profile_uuid_fkey` FOREIGN KEY (`profile_uuid`) REFERENCES `Profile`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `INVITE_CODE_TB` ADD CONSTRAINT `INVITE_CODE_TB_space_uuid_fkey` FOREIGN KEY (`space_uuid`) REFERENCES `Space`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
