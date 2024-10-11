import {
  Controller,
  Post,
  Body,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { KakaoUserDto } from './dto/kakao-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private profilesService: ProfilesService,
    private configService: ConfigService,
  ) {}

  @Post('kakao-oauth')
  @Public()
  @ApiOperation({ summary: 'kakao login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the token data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
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
    return { statusCode: HttpStatus.OK, message: 'OK', data: tokenData };
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: 'Renew Access Token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the access token data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token expired. Please log in again.',
  })
  async renewAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const accessToken = await this.authService.renewAccessToken(
      refreshTokenDto.refreshToken,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { access_token: accessToken },
    };
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User logged out',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { statusCode: HttpStatus.NO_CONTENT, message: 'No Content' };
  }
}
