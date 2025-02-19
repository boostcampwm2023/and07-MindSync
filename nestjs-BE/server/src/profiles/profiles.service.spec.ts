import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

import type { UpdateProfileDto } from './dto/update-profile.dto';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let uploadService: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: { profile: {} } },
        { provide: UploadService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    uploadService = module.get<UploadService>(UploadService);
  });

  describe('findProfileByUserUuid', () => {
    const userUuid = 'user uuid';
    const profile = { uuid: 'profile uuid', userUuid };

    beforeEach(() => {
      (prisma.profile.findUnique as jest.Mock) = jest.fn(async () => profile);
    });

    it('found', async () => {
      const res = service.findProfileByUserUuid(userUuid);

      await expect(res).resolves.toEqual(profile);
    });

    it('not found', async () => {
      (prisma.profile.findUnique as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const res = service.findProfileByUserUuid(userUuid);

      await expect(res).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const image = { filename: 'icon' } as Express.Multer.File;
    const imageUrl = 'www.test.com/image';

    beforeEach(() => {
      uploadService.uploadFile = jest.fn(async () => imageUrl);
      (prisma.profile.update as jest.Mock) = jest.fn(async (args) => ({
        uuid: profileUuid,
        userUuid,
        nickname: args.data.nickname ? args.data.nickname : 'test nickname',
        image: args.data.image
          ? args.data.image
          : configService.get<string>('BASE_IMAGE_URL'),
      }));
    });

    it('updated', async () => {
      const data = { nickname: 'new nickname' } as UpdateProfileDto;

      const profile = service.updateProfile(profileUuid, image, data);

      await expect(profile).resolves.toEqual({
        uuid: profileUuid,
        userUuid,
        image: imageUrl,
        nickname: data.nickname,
      });
    });
  });
});
