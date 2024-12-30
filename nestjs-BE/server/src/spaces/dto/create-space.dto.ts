import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { MAX_NAME_LENGTH } from '../../config/constants';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({ example: 'Sample Space', description: 'Name of the space' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'profile_uuid' })
  @ApiProperty({
    name: 'profile_uuid',
    example: uuid(),
    description: 'Profile uuid',
  })
  profileUuid: string;

  @ApiProperty({
    example: 'space-icon.png',
    description: 'Profile icon for the space',
    required: false,
  })
  icon: Express.Multer.File;
}
