import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileSpaceDto {
  @ApiProperty({
    example: 'space uuid',
    description: 'Space UUID',
  })
  @IsString()
  @IsNotEmpty()
  space_uuid: string;

  profile_uuid: string;
}
