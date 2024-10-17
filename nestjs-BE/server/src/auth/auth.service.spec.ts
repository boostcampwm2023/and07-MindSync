import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { AuthService } from './auth.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

const fetchSpy = jest.spyOn(global, 'fetch');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let refreshTokensService: RefreshTokensService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: RefreshTokensService,
          useValue: {
            createRefreshToken: jest.fn(),
            findRefreshToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: { getOrCreateUser: jest.fn() },
        },
        {
          provide: ProfilesService,
          useValue: { getOrCreateProfile: jest.fn() },
        },
      ],
    })
      .overrideProvider(JwtService)
      .useValue({ signAsync: jest.fn(), verify: jest.fn() })
      .compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokensService =
      module.get<RefreshTokensService>(RefreshTokensService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('kakaoLogin', () => {
    const kakaoUserId = 0;
    const kakaoUser = { email: 'test@email.com' };
    const user = { uuid: 'user uuid' };
    const tokens = {
      access_token: 'access token',
      refresh_token: 'refresh token',
    };

    it('kakao user exist', async () => {
      jest.spyOn(service, 'getKakaoAccount').mockResolvedValue(kakaoUser);
      jest.spyOn(service, 'login').mockResolvedValue(tokens);
      (usersService.getOrCreateUser as jest.Mock).mockResolvedValue(user);

      const tokenData = service.kakaoLogin(kakaoUserId);

      await expect(tokenData).resolves.toEqual(tokens);
    });

    it('kakao user not exist', async () => {
      jest.spyOn(service, 'getKakaoAccount').mockResolvedValue(null);

      const tokenData = service.kakaoLogin(kakaoUserId);

      await expect(tokenData).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('success', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access token');
      jest.spyOn(refreshTokensService, 'createRefreshToken').mockResolvedValue({
        token: 'refresh token',
      } as unknown as RefreshToken);

      const tokens = service.login('user uuid');

      await expect(tokens).resolves.toEqual({
        access_token: 'access token',
        refresh_token: 'refresh token',
      });
    });
  });

  describe('renewAccessToken', () => {
    it('success', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({});
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access token');
      jest.spyOn(refreshTokensService, 'findRefreshToken').mockResolvedValue({
        userUuid: 'user uuid',
      } as RefreshToken);

      const token = service.renewAccessToken('refresh token');

      await expect(token).resolves.toBe('access token');
    });

    it('fail', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      const token = service.renewAccessToken('refresh token');

      await expect(token).rejects.toThrow();
    });
  });
});
