-- DropForeignKey
ALTER TABLE `KakaoUser` DROP FOREIGN KEY `KakaoUser_userUuid_fkey`;
ALTER TABLE `RefreshToken` DROP FOREIGN KEY `RefreshToken_user_id_fkey`;
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_userId_fkey`;
ALTER TABLE `Profile_space` DROP FOREIGN KEY `Profile_space_profile_uuid_fkey`;
ALTER TABLE `Profile_space` DROP FOREIGN KEY `Profile_space_space_uuid_fkey`;
ALTER TABLE `InviteCode` DROP FOREIGN KEY `InviteCode_space_uuid_fkey`;

-- UserModel
ALTER TABLE `User` MODIFY `uuid` CHAR(36) NOT NULL;

-- RefreshModel
ALTER TABLE `RefreshToken`
    RENAME COLUMN `expiry_date` TO `expiryDate`,
    RENAME COLUMN `user_id` TO `userUuid`;
ALTER TABLE `RefreshToken` MODIFY `userUuid` CHAR(36) NOT NULL;

-- ProfileModel
ALTER TABLE `Profile` RENAME COLUMN `userId` TO `userUuid`;
ALTER TABLE `Profile`
    MODIFY `uuid` CHAR(36) NOT NULL,
    MODIFY `userUuid` CHAR(36) NOT NULL,
    RENAME INDEX `Profile_userId_key` TO `Profile_userUuid_key`;

-- SpaceModel
ALTER TABLE `Space` MODIFY `uuid` CHAR(36) NOT NULL;

-- ProfileSpaceModel
ALTER TABLE `Profile_space` RENAME `ProfileSpace`;
ALTER TABLE `ProfileSpace`
    RENAME COLUMN `space_uuid` TO `spaceUuid`,
    RENAME COLUMN `profile_uuid` TO `profileUuid`;
ALTER TABLE `ProfileSpace`
    MODIFY `spaceUuid` CHAR(36) NOT NULL,
    MODIFY `profileUuid` CHAR(36) NOT NULL,
    RENAME INDEX `Profile_space_space_uuid_profile_uuid_key` TO `ProfileSpace_spaceUuid_profileUuid_key`;

-- InviteCodeModel
ALTER TABLE `InviteCode`
    RENAME COLUMN `expiry_date` TO `expiryDate`,
    RENAME COLUMN `invite_code` TO `inviteCode`,
    RENAME COLUMN `space_uuid` TO `spaceUuid`;
ALTER TABLE `InviteCode`
    MODIFY `uuid` CHAR(36) NOT NULL,
    MODIFY `spaceUuid` CHAR(36) NOT NULL,
    RENAME INDEX `InviteCode_invite_code_key` TO `InviteCode_inviteCode_key`;

-- AddForeignKey
ALTER TABLE `KakaoUser` ADD CONSTRAINT `KakaoUser_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ProfileSpace` ADD CONSTRAINT `ProfileSpace_spaceUuid_fkey` FOREIGN KEY (`spaceUuid`) REFERENCES `Space`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ProfileSpace` ADD CONSTRAINT `ProfileSpace_profileUuid_fkey` FOREIGN KEY (`profileUuid`) REFERENCES `Profile`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InviteCode` ADD CONSTRAINT `InviteCode_spaceUuid_fkey` FOREIGN KEY (`spaceUuid`) REFERENCES `Space`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
