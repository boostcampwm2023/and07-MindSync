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
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findProfile found profile', async () => {
    const userId = generateUuid();
    const testProfile = {
      uuid: generateUuid(),
      user_id: userId,
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(testProfile);

    const user = profilesService.findProfile(userId);

    await expect(user).resolves.toEqual(testProfile);
  });

  it('findProfile not found profile', async () => {
    const userId = generateUuid();
    jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

    const user = profilesService.findProfile(userId);

    await expect(user).resolves.toBeNull();
  });

  it('findProfiles found profiles', async () => {
    const ARRAY_SIZE = 5;
    const profileUuids = Array(ARRAY_SIZE)
      .fill(null)
      .map(() => generateUuid());
    const testProfiles = profileUuids.map((uuid, index) => {
      return {
        uuid,
        user_id: generateUuid(),
        image: 'www.test.com/image',
        nickname: `nickname${index}`,
      };
    });
    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue(testProfiles);

    const profiles = profilesService.findProfiles(profileUuids);

    await expect(profiles).resolves.toEqual(testProfiles);
  });

  it('findProfiles not found profiles', async () => {
    const profileUuids = [];
    jest.spyOn(prisma.profile, 'findMany').mockResolvedValue([]);

    const profiles = profilesService.findProfiles(profileUuids);

    await expect(profiles).resolves.toEqual([]);
  });

  it('createProfile created', async () => {
    const data = {
      user_id: generateUuid(),
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    const testProfile = { uuid: generateUuid(), ...data };
    jest.spyOn(prisma.profile, 'create').mockResolvedValue(testProfile);

    const profile = profilesService.createProfile(data);

    await expect(profile).resolves.toEqual(testProfile);
  });

  it("createProfile user_id doesn't exists", async () => {
    const data = {
      user_id: generateUuid(),
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    jest
      .spyOn(prisma.profile, 'create')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'Foreign key constraint failed on the field: `user_id`',
          { code: 'P2003', clientVersion: '' },
        ),
      );

    const profile = profilesService.createProfile(data);

    await expect(profile).rejects.toThrow(PrismaClientKnownRequestError);
  });

  it('updateProfile updated', async () => {
    const data = {
      image: 'www.test.com',
      nickname: 'test nickname',
    };
    const uuid = generateUuid();
    const testProfile = { uuid: generateUuid(), user_id: uuid, ...data };
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
