import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.kakaoUser.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('getOrCreateUser', async () => {
    const testUserUuid = uuid();
    const testEmail = 'test@email.com';
    const testUser = { uuid: testUserUuid };
    await prisma.user.create({
      data: { uuid: testUserUuid },
    });
    await prisma.kakaoUser.create({
      data: {
        email: testEmail,
        userUuid: testUserUuid,
      },
    });

    const user = usersService.getOrCreateUser({ email: testEmail });
    await expect(user).resolves.toEqual(testUser);
  });

  it("getOrCreateUser user doesn't exist", async () => {
    const testEmail = 'test@email.com';

    const user = await usersService.getOrCreateUser({ email: testEmail });
    expect(user.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
