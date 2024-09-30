import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensService } from './refresh-tokens.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigModule } from '@nestjs/config';

jest.useFakeTimers();

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, ConfigModule.forRoot()],
      providers: [
        RefreshTokensService,
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideProvider(JwtService)
      .useValue({ sign: jest.fn() })
      .compile();

    service = module.get<RefreshTokensService>(RefreshTokensService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('getExpiryDate check time diff', () => {
    const currentDate = new Date();
    const expiryDate = service.getExpiryDate();
    const twoWeeksInMilliseconds = 2 * 7 * 24 * 60 * 60 * 1000;

    const timeDiff = expiryDate.getTime() - currentDate.getTime();

    expect(twoWeeksInMilliseconds == timeDiff).toBeTruthy();
  });

  it('findRefreshToken found token', async () => {
    const testToken = {
      id: 0,
      token: 'Token',
      expiryDate: service.getExpiryDate(),
      userUuid: 'UserId',
    };
    jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(testToken);

    const token = service.findRefreshToken(testToken.token);

    await expect(token).resolves.toEqual(testToken);
  });

  it('findRefreshToken not found token', async () => {
    jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(null);

    const token = service.findRefreshToken('Token');

    await expect(token).resolves.toBeNull();
  });

  it('createRefreshToken created', async () => {
    const testToken = {
      id: 0,
      token: 'Token',
      expiryDate: service.getExpiryDate(),
      userUuid: 'userId',
    };
    jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue(testToken);

    const token = service.createRefreshToken('userId');

    await expect(token).resolves.toEqual(testToken);
  });

  it('createUser user already exists', async () => {
    jest
      .spyOn(prisma.refreshToken, 'create')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `RefreshToken_token_key`',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const token = service.createRefreshToken('userId');

    await expect(token).rejects.toThrow(PrismaClientKnownRequestError);
  });

  it('deleteRefreshToken deleted', async () => {
    const testToken = {
      id: 0,
      token: 'Token',
      expiryDate: service.getExpiryDate(),
      userUuid: 'userId',
    };
    jest.spyOn(prisma.refreshToken, 'delete').mockResolvedValue(testToken);

    const token = service.deleteRefreshToken(testToken.token);

    await expect(token).resolves.toEqual(testToken);
  });

  it('deleteRefreshToken not found', async () => {
    jest
      .spyOn(prisma.refreshToken, 'delete')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'An operation failed because it depends on one or more records that were required but not found. Record to delete not found.',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const token = service.deleteRefreshToken('Token');

    await expect(token).resolves.toBeNull();
  });
});
