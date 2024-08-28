import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/magic-number';

export class CreateProfileDto {
  user_id: string;

  @ApiProperty({
    example: 'profile-image.png',
    description: 'Profile image file',
  })
  image: string;

  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'Sample nickname',
    description: 'Nickname for the profile',
  })
  nickname: string;
}
