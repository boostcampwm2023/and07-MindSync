import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import generateUuid from '../utils/uuid';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findUserByEmailAndProvider found user', async () => {
    const testUser = {
      uuid: generateUuid(),
      email: 'test@test.com',
      provider: 'kakao',
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(testUser);

    const user = usersService.findUserByEmailAndProvider(
      'test@test.com',
      'kakao',
    );

    await expect(user).resolves.toEqual(testUser);
  });

  it('findUserByEmailAndProvider not found user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const user = usersService.findUserByEmailAndProvider(
      'test@test.com',
      'kakao',
    );

    await expect(user).resolves.toBeNull();
  });

  it('getOrCreateUser', async () => {
    const testUser = {
      uuid: generateUuid(),
      email: 'test@test.com',
      provider: 'kakao',
    };
    jest.spyOn(prisma.user, 'upsert').mockResolvedValue(testUser);

    const user = usersService.getOrCreateUser({
      email: 'test@test.com',
      provider: 'kakao',
    });

    await expect(user).resolves.toEqual(testUser);
  });
});
