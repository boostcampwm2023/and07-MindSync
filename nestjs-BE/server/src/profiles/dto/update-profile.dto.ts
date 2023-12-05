import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiProperty({
    example: 'new nickname',
    description: 'Updated nickname of the profile',
    required: false,
  })
  nickname?: string;

  @ApiProperty({
    example: 'new image.png',
    description: 'Updated Profile image file',
    required: false,
  })
  image?: string;

  uuid?: string;
}
