import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import generateUuid from '../utils/uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
              create: jest.fn(),
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

  it('createUser created', async () => {
    const testUser = {
      uuid: generateUuid(),
      email: 'test@test.com',
      provider: 'kakao',
    };
    jest.spyOn(prisma.user, 'create').mockResolvedValue(testUser);

    const user = usersService.createUser({
      email: 'test@test.com',
      provider: 'kakao',
    });

    await expect(user).resolves.toEqual(testUser);
  });

  it('createUser user already exists', async () => {
    jest
      .spyOn(prisma.user, 'create')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `User_email_provider_key`',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const user = usersService.createUser({
      email: 'test@test.com',
      provider: 'kakao',
    });

    await expect(user).rejects.toThrow(PrismaClientKnownRequestError);
  });
});
