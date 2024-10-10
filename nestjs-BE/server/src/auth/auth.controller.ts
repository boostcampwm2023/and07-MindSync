import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { KakaoUserDto } from './dto/kakao-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private profilesService: ProfilesService,
    private refreshTokensService: RefreshTokensService,
    private configService: ConfigService,
  ) {}

  @Post('kakao-oauth')
  @Public()
  @ApiOperation({ summary: 'kakao login' })
  @ApiResponse({
    status: 200,
    description: 'Return the token data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found.',
  })
  async kakaoLogin(@Body() kakaoUserDto: KakaoUserDto) {
    const kakaoUserAccount = await this.authService.getKakaoAccount(
      kakaoUserDto.kakaoUserId,
    );
    if (!kakaoUserAccount) throw new NotFoundException();
    const userData = { email: kakaoUserAccount.email };
    const user = await this.usersService.getOrCreateUser(userData);
    const profileData = {
      userUuid: user.uuid,
      image: this.configService.get<string>('BASE_IMAGE_URL'),
      nickname: '익명의 사용자',
    };
    await this.profilesService.getOrCreateProfile(profileData);
    const tokenData = await this.authService.login(user.uuid);
    return { statusCode: 200, message: 'Success', data: tokenData };
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: 'Renew Access Token' })
  @ApiResponse({
    status: 200,
    description: 'Return the access token data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token expired. Please log in again.',
  })
  async renewAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const accessToken = await this.authService.renewAccessToken(
      refreshTokenDto.refreshToken,
    );
    return {
      statusCode: 200,
      message: 'Success',
      data: { access_token: accessToken },
    };
  }

  @Post('logout')
  @Public()
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    const token = await this.refreshTokensService.deleteRefreshToken(
      refreshTokenDto.refreshToken,
    );
    if (!token) throw new BadRequestException();
    return { statusCode: 204, message: 'No Content' };
  }
}
