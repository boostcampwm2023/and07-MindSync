import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RefreshToken } from '@prisma/client';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { ConfigModule } from '@nestjs/config';

const fetchSpy = jest.spyOn(global, 'fetch');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let refreshTokensService: RefreshTokensService;

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
      ],
    })
      .overrideProvider(JwtService)
      .useValue({ signAsync: jest.fn(), verify: jest.fn() })
      .compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokensService =
      module.get<RefreshTokensService>(RefreshTokensService);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('login success', async () => {
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

  it('renewAccessToken success', async () => {
    jest.spyOn(jwtService, 'verify').mockReturnValue({});
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access token');
    jest.spyOn(refreshTokensService, 'findRefreshToken').mockResolvedValue({
      userUuid: 'user uuid',
    } as RefreshToken);

    const token = service.renewAccessToken('refresh token');

    await expect(token).resolves.toBe('access token');
  });

  it('renewAccessToken fail', async () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error();
    });

    const token = service.renewAccessToken('refresh token');

    await expect(token).rejects.toThrow();
  });
});
