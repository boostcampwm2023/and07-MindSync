import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { v4 as uuid } from 'uuid';

export class JoinSpaceRequestDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'profile_uuid' })
  @ApiProperty({ example: uuid(), description: 'Profile uuid' })
  profileUuid: string;
}
