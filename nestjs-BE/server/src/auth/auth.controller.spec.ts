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

  describe('kakaoLogin', () => {
    const requestMock = { kakaoUserId: 0 };

    it('success', async () => {
      const tokenMock = {
        refresh_token: 'refresh token',
        access_token: 'access token',
      };

      (authService.kakaoLogin as jest.Mock).mockResolvedValue(tokenMock);

      const response = controller.kakaoLogin(requestMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: tokenMock,
      });
    });

    it('kakao login fail', async () => {
      (authService.kakaoLogin as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const response = controller.kakaoLogin(requestMock);

      await expect(response).rejects.toThrow(NotFoundException);
    });
  });

  describe('renewAccessToken', () => {
    const requestMock = { refreshToken: 'refresh token' };

    it('respond new access token', async () => {
      (authService.renewAccessToken as jest.Mock).mockResolvedValue(
        'new access token',
      );

      const response = controller.renewAccessToken(requestMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { access_token: 'new access token' },
      });
    });

    it('received expired token', async () => {
      (authService.renewAccessToken as jest.Mock).mockRejectedValue(
        new Error(),
      );

      const response = controller.renewAccessToken(requestMock);

      await expect(response).rejects.toThrow(Error);
    });
  });

  describe('logout', () => {
    it('received token deleted', async () => {
      const requestMock = { refreshToken: 'refresh token' };

      const response = controller.logout(requestMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: 'No Content',
      });
    });
  });
});
