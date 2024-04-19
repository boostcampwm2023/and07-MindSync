import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants, kakaoOauthConstants } from './constants';
import { stringify } from 'qs';
import { PrismaService } from 'src/prisma/prisma.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
import { BaseService } from 'src/base/base.service';
import {
  REFRESH_TOKEN_CACHE_SIZE,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from 'src/config/magic-number';
import generateUuid from 'src/utils/uuid';
import { UsersService } from 'src/users/users.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import customEnv from 'src/config/env';
import { ResponseUtils } from 'src/utils/response';
const { BASE_IMAGE_URL } = customEnv;

export interface TokenData {
  uuid: string;
  expiry_date: Date;
  user_id: string;
}

@Injectable()
export class AuthService extends BaseService<TokenData> {
  constructor(
    private jwtService: JwtService,
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: REFRESH_TOKEN_CACHE_SIZE,
      className: 'REFRESH_TOKEN_TB',
      field: 'uuid',
    });
  }

  generateKey(data: TokenData): string {
    return data.uuid;
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

  private async createAccessToken(userUuid: string): Promise<string> {
    const payload = { sub: userUuid };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessSecret,
      expiresIn: '5m',
    });
    return accessToken;
  }

  private async createRefreshToken(): Promise<Record<string, string>> {
    const refreshTokenUuid = generateUuid();
    const refreshToken = await this.jwtService.signAsync(
      { uuid: refreshTokenUuid },
      { secret: jwtConstants.refreshSecret, expiresIn: '14d' },
    );
    return { refreshToken, refreshTokenUuid };
  }

  private createRefreshTokenData(refreshTokenUuid: string, userUuid: string) {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    const refreshTokenData: TokenData = {
      uuid: refreshTokenUuid,
      expiry_date: expiryDate,
      user_id: userUuid,
    };
    return refreshTokenData;
  }

  async login(userUuid: string) {
    const { refreshToken, refreshTokenUuid } = await this.createRefreshToken();
    const accessToken = await this.createAccessToken(userUuid);
    const refreshTokenData = this.createRefreshTokenData(
      refreshTokenUuid,
      userUuid,
    );
    super.create(refreshTokenData, false);
    const tokenData = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return ResponseUtils.createResponse(HttpStatus.OK, tokenData);
  }

  async renewAccessToken(refreshToken: string) {
    const decodedToken = this.jwtService.decode(refreshToken);
    const uuid = decodedToken?.uuid;
    try {
      this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      const { data: tokenData } = await super.findOne(uuid);
      const accessToken = await this.createAccessToken(tokenData.user_id);
      return ResponseUtils.createResponse(HttpStatus.OK, {
        access_token: accessToken,
      });
    } catch (error) {
      super.remove(uuid);
      throw new UnauthorizedException(
        'Refresh token expired. Please log in again.',
      );
    }
  }

  async findUser(usersService: UsersService, email: string, provider: string) {
    const userData = await usersService.findUserByEmailAndProvider(
      email,
      provider,
    );
    return userData?.uuid;
  }

  async createUser(
    data: CreateUserDto,
    usersService: UsersService,
    profilesService: ProfilesService,
  ) {
    const createdUser = await usersService.createUser(data);
    const userUuid = createdUser.uuid;
    const profileData = {
      user_id: userUuid,
      image: BASE_IMAGE_URL,
      nickname: '익명의 사용자',
    };
    profilesService.create(profileData);
    return userUuid;
  }

  remove(refreshToken: string) {
    const decodedToken = this.jwtService.decode(refreshToken);
    const uuid = decodedToken?.uuid;
    return super.remove(uuid);
  }
}
