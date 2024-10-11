import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            kakaoLogin: jest.fn(),
            renewAccessToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('kakaoLogin', async () => {
    const requestMock = { kakaoUserId: 0 };
    const tokenMock = {
      refresh_token: 'refresh token',
      access_token: 'access token',
    };

    jest.spyOn(authService, 'kakaoLogin').mockResolvedValue(tokenMock);

    const response = controller.kakaoLogin(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: tokenMock,
    });
  });

  it('kakaoLogin kakao login fail', async () => {
    const requestMock = { kakaoUserId: 0 };

    jest
      .spyOn(authService, 'kakaoLogin')
      .mockRejectedValue(new NotFoundException());

    const response = controller.kakaoLogin(requestMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('renewAccessToken respond new access token', async () => {
    const requestMock = { refreshToken: 'refresh token' };
    jest
      .spyOn(authService, 'renewAccessToken')
      .mockResolvedValue('new access token');

    const response = controller.renewAccessToken(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { access_token: 'new access token' },
    });
  });

  it('renewAccessToken received expired token', async () => {
    const requestMock = { refreshToken: 'refresh token' };
    jest.spyOn(authService, 'renewAccessToken').mockRejectedValue(new Error());

    const response = controller.renewAccessToken(requestMock);

    await expect(response).rejects.toThrow(Error);
  });

  it('logout received token deleted', async () => {
    const requestMock = { refreshToken: 'refresh token' };

    jest.spyOn(authService, 'logout');

    const response = controller.logout(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.NO_CONTENT,
      message: 'No Content',
    });
  });
});
