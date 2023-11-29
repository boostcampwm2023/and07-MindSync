import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'email adress' })
  readonly email: string;

  @ApiProperty({ example: 'qwerasdf@!123', description: 'password' })
  readonly password: string;
}
