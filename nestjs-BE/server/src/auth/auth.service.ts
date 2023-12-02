import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { kakaoOauthConstants } from './constants';
import { stringify } from 'qs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getKakaoAccount(kakaoUserId: number) {
    const url = `https://kapi.kakao.com/v2/user/me`;
    const queryParams = { target_id_type: 'user_id', target_id: kakaoUserId };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${kakaoOauthConstants.adminKey}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: stringify(queryParams),
    });
    const responseBody = await response.json();
    if (!response.ok) return null;
    return responseBody.kakao_account;
  }

  async login(user: any) {
    const payload = { sub: user.uuid, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
