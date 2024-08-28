import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, RefreshToken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from './refresh-tokens.service';

const fetchSpy = jest.spyOn(global, 'fetch');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaClient>;
  let jwtService: DeepMockProxy<JwtService>;
  let refreshTokensService: DeepMockProxy<RefreshTokensService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [AuthService, PrismaService, RefreshTokensService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(RefreshTokensService)
      .useValue(mockDeep<RefreshToken>())
      .compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    refreshTokensService = module.get(RefreshTokensService);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('login success', async () => {
    jwtService.signAsync.mockResolvedValue('access token');
    refreshTokensService.createRefreshToken.mockResolvedValue({
      token: 'refresh token',
    } as unknown as RefreshToken);

    const tokens = service.login('user uuid');

    await expect(tokens).resolves.toEqual({
      access_token: 'access token',
      refresh_token: 'refresh token',
    });
  });

  it('renewAccessToken success', async () => {
    jwtService.verify.mockReturnValue({});
    jwtService.signAsync.mockResolvedValue('access token');
    refreshTokensService.findRefreshToken.mockResolvedValue({
      user_id: 'user uuid',
    } as RefreshToken);

    const token = service.renewAccessToken('refresh token');

    await expect(token).resolves.toBe('access token');
  });

  it('renewAccessToken fail', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error();
    });

    const token = service.renewAccessToken('refresh token');

    await expect(token).rejects.toThrow();
  });
});
