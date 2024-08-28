-- DropForeignKey
ALTER TABLE `INVITE_CODE_TB` DROP FOREIGN KEY `INVITE_CODE_TB_space_uuid_fkey`;

-- DropForeignKey
ALTER TABLE `REFRESH_TOKEN_TB` DROP FOREIGN KEY `REFRESH_TOKEN_TB_user_id_fkey`;

-- RenameIndex
ALTER TABLE `INVITE_CODE_TB` RENAME INDEX `INVITE_CODE_TB_invite_code_key` TO `InviteCode_invite_code_key`;

-- RenameTable
ALTER TABLE `INVITE_CODE_TB` RENAME `InviteCode`;

-- RenameTable
ALTER TABLE `REFRESH_TOKEN_TB` RENAME `RefreshToken`;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InviteCode` ADD CONSTRAINT `InviteCode_space_uuid_fkey` FOREIGN KEY (`space_uuid`) REFERENCES `Space`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
