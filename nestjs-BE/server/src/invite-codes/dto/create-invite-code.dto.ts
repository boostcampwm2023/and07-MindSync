import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { v4 as uuid } from 'uuid';

export class CreateInviteCodeDto {
  @ApiProperty({
    example: uuid(),
    description: 'Profile UUID',
    name: 'profile_uuid',
  })
  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'profile_uuid' })
  profileUuid: string;
}
