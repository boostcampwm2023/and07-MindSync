import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { KakaoUserDto } from './dto/kakao-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    const tokenData = await this.authService.kakaoLogin(
      kakaoUserDto.kakaoUserId,
    );
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
