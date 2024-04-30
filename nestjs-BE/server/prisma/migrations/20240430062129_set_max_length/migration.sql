/*
  Warnings:

  - You are about to alter the column `nickname` on the `PROFILE_TB` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `name` on the `SPACE_TB` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `PROFILE_TB` MODIFY `nickname` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `SPACE_TB` MODIFY `name` VARCHAR(20) NOT NULL;
