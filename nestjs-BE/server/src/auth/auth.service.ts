import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants, kakaoOauthConstants } from './constants';
import { stringify } from 'qs';
import { PrismaServiceMySQL } from 'src/prisma/prisma.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
import { BaseService } from 'src/base/base.service';
import {
  REFRESH_TOKEN_CACHE_SIZE,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from 'src/config/magic-number';
import generateUuid from 'src/utils/uuid';

interface TokenData {
  uuid?: string;
  token: string;
  expiry_date: Date;
  user_id: string;
}

@Injectable()
export class AuthService extends BaseService<TokenData> {
  constructor(
    private jwtService: JwtService,
    protected prisma: PrismaServiceMySQL,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: REFRESH_TOKEN_CACHE_SIZE,
      className: 'REFRESH_TOKEN_TB',
      field: 'token',
    });
  }

  generateKey(data: TokenData): string {
    return data.token;
  }

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

  async createAccessToken(userUuid: string): Promise<string> {
    const payload = { sub: userUuid };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async createRefreshToken(): Promise<string> {
    const refreshTokenPayload = { uuid: generateUuid() };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: jwtConstants.secret,
      expiresIn: '14d',
    });
    return refreshToken;
  }

  createRefreshTokenData(refreshToken: string, userUuid: string) {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    const refreshTokenData: TokenData = {
      token: refreshToken,
      expiry_date: expiryDate,
      user_id: userUuid,
    };
    return refreshTokenData;
  }

  async login(user: any) {
    const refreshToken = await this.createRefreshToken();
    const accessToken = await this.createAccessToken(user.uuid);
    const refreshTokenData = this.createRefreshTokenData(
      refreshToken,
      user.uuid,
    );
    super.create(refreshTokenData);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async renewAccessToken(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret,
      });
      const tokenData = await this.getDataFromCacheOrDB(refreshToken);
      if (!tokenData) throw new Error('No token data found');
      const accessToken = await this.createAccessToken(tokenData.user_id);
      return accessToken;
    } catch (error) {
      super.remove(refreshToken);
      throw new UnauthorizedException(
        'Refresh token expired. Please log in again.',
      );
    }
  }
}
