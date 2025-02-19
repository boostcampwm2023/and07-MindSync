import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/constants';

export class UpdateProfileDto {
  @IsOptional()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new nickname',
    description: 'Updated nickname of the profile',
    required: false,
  })
  nickname: string;

  @ApiProperty({
    example: 'new image.png',
    description: 'Updated Profile image file',
    required: false,
  })
  image: Express.Multer.File;
}
