import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'refresh_token' })
  @ApiProperty({
    example: 'refresh token',
    description: 'refresh token',
  })
  refreshToken: string;
}
