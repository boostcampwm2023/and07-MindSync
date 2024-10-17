import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import generateUuid from '../utils/uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('updateProfile updated', async () => {
    const data = {
      image: 'www.test.com',
      nickname: 'test nickname',
    };
    const uuid = generateUuid();
    const testProfile = { uuid: generateUuid(), userUuid: uuid, ...data };
    jest.spyOn(prisma.profile, 'update').mockResolvedValue(testProfile);

    const profile = profilesService.updateProfile(uuid, data);

    await expect(profile).resolves.toEqual(testProfile);
  });

  it("updateProfile user_id doesn't exists", async () => {
    const data = {
      image: 'www.test.com',
      nickname: 'test nickname',
    };
    jest
      .spyOn(prisma.profile, 'update')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'An operation failed because it depends on one or more records that were required but not found. Record to update not found.',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const profile = profilesService.updateProfile(generateUuid(), data);

    await expect(profile).resolves.toBeNull();
  });
});
