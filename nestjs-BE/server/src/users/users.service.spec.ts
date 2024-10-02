import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { KakaoUser, User } from '@prisma/client';

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
            $transaction: jest.fn(),
            user: { create: jest.fn(), findUnique: jest.fn() },
            kakaoUser: { create: jest.fn(), findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('getOrCreateUser user exist', async () => {
    const testUser: User = { uuid: uuid() };
    const testKakaoUser: KakaoUser = {
      id: 0,
      email: 'test@email.com',
      userUuid: testUser.uuid,
    };

    jest
      .spyOn(prisma, '$transaction')
      .mockImplementation(async (callback) => callback(prisma));
    jest.spyOn(prisma.kakaoUser, 'findUnique').mockResolvedValue(testKakaoUser);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(testUser);

    const user = usersService.getOrCreateUser({ email: testKakaoUser.email });

    await expect(user).resolves.toEqual(testUser);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });

  it("getOrCreateUser user doesn't exist", async () => {
    const newUser: User = { uuid: uuid() };
    const newKakaoUser: KakaoUser = {
      id: 0,
      email: 'test@email.com',
      userUuid: newUser.uuid,
    };

    jest
      .spyOn(prisma, '$transaction')
      .mockImplementation(async (callback) => callback(prisma));
    jest.spyOn(prisma.kakaoUser, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.kakaoUser, 'create').mockResolvedValue(newKakaoUser);
    jest.spyOn(prisma.user, 'create').mockResolvedValue(newUser);

    const user = usersService.getOrCreateUser({ email: newKakaoUser.email });

    await expect(user).resolves.toEqual(newUser);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
