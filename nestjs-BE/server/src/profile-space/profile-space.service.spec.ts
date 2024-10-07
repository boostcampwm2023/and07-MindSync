import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSpaceService } from './profile-space.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileSpace } from '@prisma/client';

describe('ProfileSpaceService', () => {
  let profileSpaceService: ProfileSpaceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileSpaceService,
        {
          provide: PrismaService,
          useValue: {
            profileSpace: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    profileSpaceService = module.get<ProfileSpaceService>(ProfileSpaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('isSpaceEmpty empty', async () => {
    const spaceUuid = 'space uuid';

    (prisma.profileSpace.findFirst as jest.Mock).mockResolvedValue(null);

    const isSpaceEmpty = profileSpaceService.isSpaceEmpty(spaceUuid);

    await expect(isSpaceEmpty).resolves.toBeTruthy();
  });

  it('isSpaceEmpty not empty', async () => {
    const spaceUuid = 'space uuid';
    const profileSpace = 'profile space';

    (prisma.profileSpace.findFirst as jest.Mock).mockResolvedValue(
      profileSpace,
    );

    const isSpaceEmpty = profileSpaceService.isSpaceEmpty(spaceUuid);

    await expect(isSpaceEmpty).resolves.toBeFalsy();
  });

  it('isProfileInSpace joined', async () => {
    const spaceUuid = 'space uuid';
    const profileUuid = 'profile uuid';
    const profileSpaceMock = { profileUuid, spaceUuid } as ProfileSpace;

    (prisma.profileSpace.findUnique as jest.Mock).mockResolvedValue(
      profileSpaceMock,
    );

    const isProfileInSpace = profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );

    await expect(isProfileInSpace).resolves.toBeTruthy();
  });

  it('isProfileInSpace not joined', async () => {
    const spaceUuid = 'space uuid';
    const profileUuid = 'profile uuid';

    (prisma.profileSpace.findUnique as jest.Mock).mockResolvedValue(null);

    const isProfileInSpace = profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );

    await expect(isProfileInSpace).resolves.toBeFalsy();
  });
});
