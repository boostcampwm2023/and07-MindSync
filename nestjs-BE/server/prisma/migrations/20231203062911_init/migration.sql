-- CreateTable
CREATE TABLE `USER_TB` (
    `uuid` VARCHAR(32) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `USER_TB_email_key`(`email`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROFILE_TB` (
    `uuid` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(32) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,

    INDEX `PROFILE_TB_user_id_idx`(`user_id`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SPACE_TB` (
    `uuid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROFILE_SPACE_TB` (
    `space_uuid` VARCHAR(32) NOT NULL,
    `profile_uuid` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`space_uuid`, `profile_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PROFILE_TB` ADD CONSTRAINT `PROFILE_TB_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `USER_TB`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROFILE_SPACE_TB` ADD CONSTRAINT `PROFILE_SPACE_TB_space_uuid_fkey` FOREIGN KEY (`space_uuid`) REFERENCES `SPACE_TB`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROFILE_SPACE_TB` ADD CONSTRAINT `PROFILE_SPACE_TB_profile_uuid_fkey` FOREIGN KEY (`profile_uuid`) REFERENCES `PROFILE_TB`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
