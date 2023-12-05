import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  user_id: string;

  @ApiProperty({
    example: 'profile-image.png',
    description: 'Profile image file',
  })
  image: string;

  @ApiProperty({
    example: 'Sample nickname',
    description: 'Nickname for the profile',
  })
  nickname: string;
}
