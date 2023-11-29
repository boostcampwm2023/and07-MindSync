import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    example: 'user-uuid-123',
    description: 'User UUID for the profile',
  })
  user_id: string;

  @ApiProperty({
    example: 'profile-image.png',
    description: 'Image URL for the profile',
  })
  image: string;

  @ApiProperty({
    example: 'Sample nickname',
    description: 'Nickname for the profile',
  })
  nickname: string;
}
