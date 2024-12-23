import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { MAX_NAME_LENGTH } from '../../config/constants';

export class UpdateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'profile_uuid' })
  @ApiProperty({
    name: 'profile_uuid',
    example: uuid(),
    description: 'Profile uuid',
  })
  profileUuid: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name: string;

  @IsOptional()
  @ApiProperty({
    example: 'new image',
    description: 'Updated space icon',
    required: false,
  })
  icon: string;
}
