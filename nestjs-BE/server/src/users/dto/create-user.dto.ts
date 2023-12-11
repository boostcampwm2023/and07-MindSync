import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'email adress' })
  readonly email: string;

  @ApiProperty({ example: 'kakao', description: 'social site name' })
  readonly provider: string;
}
