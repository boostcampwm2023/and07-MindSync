-- RenameIndex
ALTER TABLE `USER_TB` RENAME INDEX `USER_TB_email_provider_key` TO `User_email_provider_key`;

-- RenameTable
ALTER TABLE `USER_TB` RENAME `User`;
