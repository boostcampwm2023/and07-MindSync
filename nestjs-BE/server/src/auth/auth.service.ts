import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants, kakaoOauthConstants } from './constants';
import { stringify } from 'qs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokensService } from './refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
    protected prisma: PrismaService,
  ) {}

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

  private async createAccessToken(userUuid: string): Promise<string> {
    const payload = { sub: userUuid };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessSecret,
      expiresIn: '5m',
    });
    return accessToken;
  }

  async login(userUuid: string) {
    const accessToken = await this.createAccessToken(userUuid);
    const refreshToken =
      await this.refreshTokensService.createRefreshToken(userUuid);
    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    };
  }

  async renewAccessToken(refreshToken: string): Promise<string> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      const token =
        await this.refreshTokensService.findRefreshToken(refreshToken);
      const accessToken = await this.createAccessToken(token.user_id);
      return accessToken;
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token expired. Please log in again.',
      );
    }
  }
}
