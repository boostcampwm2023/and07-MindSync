import { ApiProperty } from '@nestjs/swagger';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Sample Space', description: 'Name of the space' })
  name: string;

  @ApiProperty({
    example: 'space-icon.png',
    description: 'Profile icon for the space',
  })
  icon: string;
}
