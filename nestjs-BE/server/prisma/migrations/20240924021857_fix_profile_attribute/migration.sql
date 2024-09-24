-- RenameColumn
ALTER TABLE `Profile` RENAME COLUMN `user_id` TO `userId`;

-- AlterTable
ALTER TABLE `Profile`
    MODIFY `userId` VARCHAR(36) NOT NULL,
    MODIFY `uuid` VARCHAR(36) NOT NULL,
    RENAME INDEX `Profile_user_id_key` TO `Profile_userId_key`;

-- RenameForeignKey
ALTER TABLE `Profile`
    DROP FOREIGN KEY `Profile_user_id_fkey`,
    ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
