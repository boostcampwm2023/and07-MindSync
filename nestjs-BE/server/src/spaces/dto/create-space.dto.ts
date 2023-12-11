import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sample Space', description: 'Name of the space' })
  name: string;

  @ApiProperty({
    example: 'space-icon.png',
    description: 'Profile icon for the space',
  })
  icon: string;
}
