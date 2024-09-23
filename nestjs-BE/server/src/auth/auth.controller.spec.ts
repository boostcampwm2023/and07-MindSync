import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RefreshToken, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ProfilesService } from '../profiles/profiles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let refreshTokensService: RefreshTokensService;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getKakaoAccount: jest.fn(),
            login: jest.fn(),
            renewAccessToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserByEmailAndProvider: jest.fn(),
            getOrCreateUser: jest.fn(),
          },
        },
        {
          provide: ProfilesService,
          useValue: {
            getOrCreateProfile: jest.fn(),
          },
        },
        {
          provide: RefreshTokensService,
          useValue: { deleteRefreshToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    refreshTokensService =
      module.get<RefreshTokensService>(RefreshTokensService);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('kakaoLogin', async () => {
    const requestMock = { kakaoUserId: 0 };
    const kakaoUserAccountMock = { email: 'kakao email' };
    const tokenMock = {
      refresh_token: 'refresh token',
      access_token: 'access token',
    };
    jest
      .spyOn(authService, 'getKakaoAccount')
      .mockResolvedValue(kakaoUserAccountMock);
    jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValue({
      uuid: 'user uuid',
    } as User);
    jest.spyOn(authService, 'login').mockResolvedValue(tokenMock);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: tokenMock,
    });
  });

  it('kakaoLogin kakao login fail', async () => {
    const requestMock = { kakaoUserId: 0 };
    jest.spyOn(authService, 'getKakaoAccount').mockResolvedValue(null);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('renewAccessToken respond new access token', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    jest
      .spyOn(authService, 'renewAccessToken')
      .mockResolvedValue('new access token');

    const response = controller.renewAccessToken(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: { access_token: 'new access token' },
    });
  });

  it('renewAccessToken received expired token', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    jest.spyOn(authService, 'renewAccessToken').mockRejectedValue(new Error());

    const response = controller.renewAccessToken(requestMock);

    await expect(response).rejects.toThrow(Error);
  });

  it('logout received token deleted', async () => {
    const requestMock = { refresh_token: 'refresh token' };
    const token = {} as RefreshToken;
    jest
      .spyOn(refreshTokensService, 'deleteRefreshToken')
      .mockResolvedValue(token);

    const response = controller.logout(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 204,
      message: 'No Content',
    });
  });

  it('logout received token not found', async () => {
    const requestMock = { refresh_token: 'bad refresh token' };
    jest
      .spyOn(refreshTokensService, 'deleteRefreshToken')
      .mockResolvedValue(null);

    const response = controller.logout(requestMock);

    await expect(response).rejects.toThrow(BadRequestException);
  });
});
