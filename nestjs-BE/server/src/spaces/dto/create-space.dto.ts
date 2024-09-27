import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/magic-number';
import { Expose } from 'class-transformer';
import { v4 as uuid } from 'uuid';

export class CreateSpaceRequestV2Dto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({ example: 'Sample Space', description: 'Name of the space' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'profile_uuid' })
  @ApiProperty({ example: uuid(), description: 'Profile uuid' })
  profileUuid: string;

  @ApiProperty({
    example: 'space-icon.png',
    description: 'Profile icon for the space',
  })
  icon: string;
}

export class CreateSpaceRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({ example: 'Sample Space', description: 'Name of the space' })
  name: string;

  @ApiProperty({
    example: 'space-icon.png',
    description: 'Profile icon for the space',
  })
  icon: string;
}

export class CreateSpacePrismaDto {
  name: string;
  icon: string;
}
