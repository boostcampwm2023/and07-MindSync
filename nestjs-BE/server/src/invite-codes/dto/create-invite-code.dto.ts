import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteCodeDto {
  @ApiProperty({
    example: 'space uuid',
    description: 'Space UUID',
  })
  @IsNotEmpty()
  @IsString()
  space_uuid: string;
}
