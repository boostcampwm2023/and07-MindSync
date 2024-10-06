import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSpaceService } from './profile-space.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfileSpaceService', () => {
  let profileSpaceService: ProfileSpaceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileSpaceService,
        {
          provide: PrismaService,
          useValue: { profileSpace: { findFirst: jest.fn() } },
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
});
