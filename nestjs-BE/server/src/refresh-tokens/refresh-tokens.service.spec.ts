import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { v4 as uuid } from 'uuid';
import { RefreshTokensService } from './refresh-tokens.service';
import { PrismaService } from '../prisma/prisma.service';
import { getExpiryDate } from '../utils/date';

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
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokensService>(RefreshTokensService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('createRefreshToken created', async () => {
    const TWO_WEEK = 14;

    const testUserUuid = uuid();
    const twoWeek = new Date();
    twoWeek.setDate(twoWeek.getDate() + TWO_WEEK);

    (prisma.refreshToken.create as jest.Mock).mockImplementation(
      async ({ data }) => {
        return {
          id: 0,
          token: data.token,
          expiryDate: data.expiryDate,
          userUuid: data.userUuid,
        };
      },
    );

    const token = await service.createRefreshToken(testUserUuid);

    expect(token.token).toMatch(
      /^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+$/,
    );
    expect(token.expiryDate.toISOString()).toBe(twoWeek.toISOString());
    expect(token.userUuid).toBe(testUserUuid);
  });

  it('deleteRefreshToken deleted', async () => {
    const testToken = {
      id: 0,
      token: 'Token',
      expiryDate: getExpiryDate({ week: 2 }),
      userUuid: 'userId',
    };
    (prisma.refreshToken.delete as jest.Mock).mockResolvedValue(testToken);

    const token = service.deleteRefreshToken(testToken.token);

    await expect(token).resolves.toEqual(testToken);
  });

  it('deleteRefreshToken not found', async () => {
    (prisma.refreshToken.delete as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were required but not found. Record to delete not found.',
        { code: 'P2025', clientVersion: '' },
      ),
    );

    const token = service.deleteRefreshToken('Token');

    await expect(token).resolves.toBeNull();
  });
});
