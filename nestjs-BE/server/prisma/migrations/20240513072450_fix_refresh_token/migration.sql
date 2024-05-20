/*
  Warnings:

  - The primary key for the `RefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RefreshToken` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    RENAME COLUMN `uuid` TO `token`,
    ADD PRIMARY KEY (`id`);

ALTER TABLE `RefreshToken` MODIFY `token` VARCHAR(210) NOT NULL;

-- CreateIndex
CREATE INDEX `RefreshToken_token_idx` ON `RefreshToken`(`token`);
