import { PartialType } from '@nestjs/mapped-types';
import { CreateSpaceDto } from './create-space.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'new image',
    description: 'Updated space icon',
    required: false,
  })
  icon?: string;

  uuid?: string;
}
