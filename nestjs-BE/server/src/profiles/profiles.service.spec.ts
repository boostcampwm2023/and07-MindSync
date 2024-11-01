import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let uploadService: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: UploadService,
          useValue: { uploadFile: jest.fn() },
        },
      ],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    uploadService = module.get<UploadService>(UploadService);
  });

  describe('updateProfile', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const image = { filename: 'icon' } as Express.Multer.File;
    const imageUrl = 'www.test.com/image';

    beforeEach(() => {
      jest.spyOn(profilesService, 'verifyUserProfile').mockResolvedValue(true);
      (uploadService.uploadFile as jest.Mock).mockResolvedValue(imageUrl);
      (prisma.profile.update as jest.Mock).mockImplementation(async (args) => {
        return {
          uuid: profileUuid,
          userUuid,
          nickname: args.data.nickname ? args.data.nickname : 'test nickname',
          image: args.data.image
            ? args.data.image
            : configService.get<string>('BASE_IMAGE_URL'),
        };
      });
    });

    it('updated', async () => {
      const data = { nickname: 'new nickname' };

      const profile = profilesService.updateProfile(
        userUuid,
        profileUuid,
        image,
        data,
      );

      await expect(profile).resolves.toEqual({
        uuid: profileUuid,
        userUuid,
        image: imageUrl,
        nickname: data.nickname,
      });
    });

    it('wrong user uuid', async () => {
      const data = {};

      jest
        .spyOn(profilesService, 'verifyUserProfile')
        .mockRejectedValue(new ForbiddenException());

      const profile = profilesService.updateProfile(
        userUuid,
        profileUuid,
        image,
        data,
      );

      await expect(profile).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyUserProfile', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const image = 'www.test.com';
    const nickname = 'test nickname';

    beforeEach(() => {
      jest
        .spyOn(profilesService, 'findProfileByProfileUuid')
        .mockResolvedValue({ uuid: profileUuid, userUuid, image, nickname });
    });

    it('verified', async () => {
      const res = profilesService.verifyUserProfile(userUuid, profileUuid);

      await expect(res).resolves.toBeTruthy();
    });

    it('profile not found', async () => {
      jest
        .spyOn(profilesService, 'findProfileByProfileUuid')
        .mockResolvedValue(null);

      const res = profilesService.verifyUserProfile(userUuid, profileUuid);

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('profile user not own', async () => {
      const res = profilesService.verifyUserProfile(
        'other user uuid',
        profileUuid,
      );

      await expect(res).rejects.toThrow(ForbiddenException);
    });
  });
});
