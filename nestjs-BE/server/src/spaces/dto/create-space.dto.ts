import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/magic-number';

export class CreateSpaceDto {
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
