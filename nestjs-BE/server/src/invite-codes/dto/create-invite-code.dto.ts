import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInviteCodeDto {
  @ApiProperty({
    example: 'space uuid',
    description: 'Space UUID',
  })
  @IsNotEmpty()
  @IsString()
  space_uuid: string;
}
