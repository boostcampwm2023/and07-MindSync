import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'qs';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokensService: RefreshTokensService,
    private usersService: UsersService,
    private profilesService: ProfilesService,
  ) {}

  async kakaoLogin(kakaoUserId: number) {
    const kakaoUserAccount = await this.getKakaoAccount(kakaoUserId);
    if (!kakaoUserAccount) throw new NotFoundException();
    const userData = { email: kakaoUserAccount.email };
    const user = await this.usersService.getOrCreateUser(userData);
    const profileData = {
      userUuid: user.uuid,
      image: this.configService.get<string>('BASE_IMAGE_URL'),
      nickname: '익명의 사용자',
    };
    await this.profilesService.getOrCreateProfile(profileData);
    const tokenData = await this.login(user.uuid);
    return tokenData;
  }

  async getKakaoAccount(kakaoUserId: number) {
    const url = `https://kapi.kakao.com/v2/user/me`;
    const queryParams = { target_id_type: 'user_id', target_id: kakaoUserId };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${this.configService.get<string>(
          'KAKAO_ADMIN_KEY',
        )}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: stringify(queryParams),
    });
    const responseBody = await response.json();
    if (!response.ok) return null;
    return responseBody.kakao_account;
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

  async logout(refreshToken: string) {
    await this.refreshTokensService.deleteRefreshToken(refreshToken);
  }

  private async createAccessToken(userUuid: string): Promise<string> {
    const payload = { sub: userUuid };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '5m',
    });
    return accessToken;
  }

  async renewAccessToken(refreshToken: string): Promise<string> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const token =
        await this.refreshTokensService.findRefreshToken(refreshToken);
      if (!token) {
        throw new UnauthorizedException(
          'Refresh token expired. Please log in again.',
        );
      }
      const accessToken = await this.createAccessToken(token.userUuid);
      return accessToken;
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token expired. Please log in again.',
      );
    }
  }
}
