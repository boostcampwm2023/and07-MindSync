import { ApiProperty } from '@nestjs/swagger';

export class ProfileSpaceDto {
  @ApiProperty({
    example: 'profile-uuid-123',
    description: 'UUID of the profile',
  })
  profile_uuid: string;

  @ApiProperty({ example: 'space-uuid-456', description: 'UUID of the space' })
  space_uuid: string;
}
