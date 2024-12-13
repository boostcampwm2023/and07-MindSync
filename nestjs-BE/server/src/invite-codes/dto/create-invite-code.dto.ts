import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { v4 as uuid } from 'uuid';

export class CreateInviteCodeDto {
  @ApiProperty({
    example: uuid(),
    description: 'Profile UUID',
  })
  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'profile_uuid' })
  profileUuid: string;

  @ApiProperty({
    example: uuid(),
    description: 'Space UUID',
  })
  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'space_uuid' })
  spaceUuid: string;
}
