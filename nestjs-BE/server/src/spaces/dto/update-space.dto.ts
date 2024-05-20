import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from 'src/config/magic-number';

export class UpdateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name: string;

  @ApiProperty({
    example: 'new image',
    description: 'Updated space icon',
    required: false,
  })
  icon: string;
}
