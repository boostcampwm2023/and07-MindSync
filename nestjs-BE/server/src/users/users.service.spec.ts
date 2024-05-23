import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import generateUuid from '../utils/uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    usersService = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  it('findUserByEmailAndProvider found user', async () => {
    const testUser = {
      uuid: generateUuid(),
      email: 'test@test.com',
      provider: 'kakao',
    };
    prisma.user.findUnique.mockResolvedValue(testUser);

    const user = usersService.findUserByEmailAndProvider(
      'test@test.com',
      'kakao',
    );

    await expect(user).resolves.toEqual(testUser);
  });

  it('findUserByEmailAndProvider not found user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

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
    prisma.user.create.mockResolvedValue(testUser);

    const user = usersService.createUser({
      email: 'test@test.com',
      provider: 'kakao',
    });

    await expect(user).resolves.toEqual(testUser);
  });

  it('createUser user already exists', async () => {
    prisma.user.create.mockRejectedValue(
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
