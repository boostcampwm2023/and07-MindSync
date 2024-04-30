import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { KakaoUserDto } from './dto/kakao-user.dto';
import { UsersService } from 'src/users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import customEnv from 'src/config/env';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private profilesService: ProfilesService,
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
    const email = kakaoUserAccount.email;
    const user = await this.usersService.findUserByEmailAndProvider(
      email,
      'kakao',
    );
    let userUuid = user?.uuid;
    if (!userUuid) {
      const data = { email, provider: 'kakao' };
      const createdUser = await this.usersService.createUser(data);
      userUuid = createdUser.uuid;
      const profileData = {
        user_id: createdUser.uuid,
        image: customEnv.BASE_IMAGE_URL,
        nickname: '익명의 사용자',
      };
      await this.profilesService.create(profileData);
    }
    return this.authService.login(userUuid);
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
  renewAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refresh_token;
    return this.authService.renewAccessToken(refreshToken);
  }

  @Post('logout')
  @Public()
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    const refreshToken = refreshTokenDto.refresh_token;
    return this.authService.remove(refreshToken);
  }
}
