import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, RefreshToken, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ProfilesService } from '../profiles/profiles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let refreshTokensService: DeepMockProxy<RefreshTokensService>;
  let usersService: DeepMockProxy<UsersService>;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        ProfilesService,
        RefreshTokensService,
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockDeep<AuthService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(UsersService)
      .useValue(mockDeep<UsersService>())
      .overrideProvider(ProfilesService)
      .useValue(mockDeep<ProfilesService>())
      .overrideProvider(RefreshTokensService)
      .useValue(mockDeep<RefreshTokensService>())
      .compile();

    controller = module.get<AuthController>(AuthController);
    refreshTokensService = module.get(RefreshTokensService);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('kakaoLogin user have been logged in', async () => {
    const requestMock = { kakaoUserId: 0 };
    const kakaoUserAccountMock = { email: 'kakao email' };
    const tokenMock = {
      refresh_token: 'refresh token',
      access_token: 'access token',
    };
    authService.getKakaoAccount.mockResolvedValue(kakaoUserAccountMock);
    usersService.findUserByEmailAndProvider.mockResolvedValue({
      uuid: 'user uuid',
    } as User);
    authService.login.mockResolvedValue(tokenMock);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: tokenMock,
    });
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('kakaoLogin user login first time', async () => {
    const requestMock = { kakaoUserId: 0 };
    const kakaoUserAccountMock = { email: 'kakao email' };
    const tokenMock = {
      refresh_token: 'refresh token',
      access_token: 'access token',
    };
    authService.getKakaoAccount.mockResolvedValue(kakaoUserAccountMock);
    usersService.createUser.mockResolvedValue({ uuid: 'user uuid' } as User);
    authService.login.mockResolvedValue(tokenMock);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: tokenMock,
    });
    expect(usersService.createUser).toHaveBeenCalled();
  });

  it('kakaoLogin kakao login fail', async () => {
    const requestMock = { kakaoUserId: 0 };
    authService.getKakaoAccount.mockResolvedValue(null);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('renewAccessToken respond new access token', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    authService.renewAccessToken.mockResolvedValue('new access token');

    const response = controller.renewAccessToken(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: { access_token: 'new access token' },
    });
  });

  it('renewAccessToken received expired token', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    authService.renewAccessToken.mockRejectedValue(new Error());

    const response = controller.renewAccessToken(requestMock);

    await expect(response).rejects.toThrow(Error);
  });

  it('logout received token deleted', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    const token = {} as RefreshToken;
    refreshTokensService.deleteRefreshToken.mockResolvedValue(token);

    const response = controller.logout(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 204,
      message: 'No Content',
    });
  });

  it('logout received token not found', async () => {
    const requestMock = { refresh_token: 'bad refresh token' };
    refreshTokensService.deleteRefreshToken.mockResolvedValue(null);

    const response = controller.logout(requestMock);

    await expect(response).rejects.toThrow(BadRequestException);
  });
});
