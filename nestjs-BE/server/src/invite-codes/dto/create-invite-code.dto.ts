import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInviteCodeDto {
  @IsNotEmpty()
  @IsString()
  space_uuid: string;
}
