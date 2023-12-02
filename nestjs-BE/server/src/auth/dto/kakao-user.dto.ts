import { IsNumber } from 'class-validator';

export class KakaoUserDto {
  @IsNumber()
  kakaoUserId: number;
}
