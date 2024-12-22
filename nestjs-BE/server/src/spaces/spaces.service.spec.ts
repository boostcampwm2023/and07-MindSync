import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Space } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpacePrismaDto } from './dto/update-space.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UploadService } from '../upload/upload.service';
import { ProfilesService } from '../profiles/profiles.service';

describe('SpacesService', () => {
  let spacesService: SpacesService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let profileSpaceService: ProfileSpaceService;
  let uploadService: UploadService;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        SpacesService,
        {
          provide: PrismaService,
          useValue: {
            space: { create: jest.fn(), update: jest.fn() },
            profile: { findMany: jest.fn() },
          },
        },
        {
          provide: ProfileSpaceService,
          useValue: {
            createProfileSpace: jest.fn(),
            deleteProfileSpace: jest.fn(),
            isSpaceEmpty: jest.fn(async () => true),
            isProfileInSpace: jest.fn(async () => true),
          },
        },
        {
          provide: ProfilesService,
          useValue: { verifyUserProfile: jest.fn(async () => true) },
        },
        {
          provide: UploadService,
          useValue: { uploadFile: jest.fn() },
        },
      ],
    }).compile();

    spacesService = module.get<SpacesService>(SpacesService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    profileSpaceService = module.get<ProfileSpaceService>(ProfileSpaceService);
    uploadService = module.get<UploadService>(UploadService);
    profilesService = module.get<ProfilesService>(ProfilesService);
  });

  describe('findSpace', () => {
    const spaceMock = { uuid: 'space uuid' } as Space;

    beforeEach(() => {
      jest
        .spyOn(spacesService, 'findSpaceBySpaceUuid')
        .mockResolvedValue(spaceMock);
    });

    it('found space', async () => {
      const space = spacesService.findSpace(spaceMock.uuid);

      await expect(space).resolves.toEqual(spaceMock);
    });

    it('space not found', async () => {
      jest.spyOn(spacesService, 'findSpaceBySpaceUuid').mockResolvedValue(null);

      const space = spacesService.findSpace(spaceMock.uuid);

      await expect(space).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSpace', () => {
    const icon = { filename: 'icon' } as Express.Multer.File;
    const iconUrlMock = 'www.test.com/image';

    beforeEach(() => {
      (uploadService.uploadFile as jest.Mock).mockResolvedValue(iconUrlMock);
      (prisma.space.create as jest.Mock).mockImplementation((args) => {
        return {
          uuid: args.data.uuid,
          name: args.data.name,
          icon: args.data.icon,
        };
      });
    });

    it('created', async () => {
      const createSpaceDto = {
        name: 'new space name',
      } as CreateSpaceDto;

      const space = await spacesService.createSpace(icon, createSpaceDto);

      expect(space.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(space.name).toBe(createSpaceDto.name);
      expect(space.icon).toBe(iconUrlMock);
      expect(uploadService.uploadFile).toHaveBeenCalled();
      expect(prisma.space.create).toHaveBeenCalled();
    });

    it('icon not requested', async () => {
      const createSpaceDto = {
        name: 'new space name',
      } as CreateSpaceDto;

      const space = await spacesService.createSpace(undefined, createSpaceDto);

      expect(space.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(space.name).toBe(createSpaceDto.name);
      expect(space.icon).toBe(configService.get<string>('APP_ICON_URL'));
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.space.create).toHaveBeenCalled();
    });
  });

  describe('updateSpace', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const iconUrlMock = 'www.test.com/image';

    beforeEach(() => {
      (uploadService.uploadFile as jest.Mock).mockResolvedValue(iconUrlMock);
      (prisma.space.update as jest.Mock).mockImplementation(async (args) => {
        const space = {
          uuid: args.where.uuid,
          name: args.data.name ? args.data.name : 'test space',
          icon: args.data.icon
            ? args.data.icon
            : configService.get<string>('APP_ICON_URL'),
        };
        return space;
      });
    });

    it('update space', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).resolves.toEqual({
        uuid: spaceUuid,
        name: updateSpaceDto.name,
        icon: iconUrlMock,
      });
      expect(uploadService.uploadFile).toHaveBeenCalled();
      expect(prisma.space.update).toHaveBeenCalled();
    });

    it('icon not requested', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        undefined,
        updateSpaceDto,
      );

      await expect(space).resolves.toEqual({
        uuid: spaceUuid,
        name: updateSpaceDto.name,
        icon: configService.get<string>('APP_ICON_URL'),
      });
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.space.update).toHaveBeenCalled();
    });

    it('name not requested', async () => {
      const updateSpaceDto = {} as UpdateSpacePrismaDto;

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).resolves.toEqual({
        uuid: spaceUuid,
        name: 'test space',
        icon: iconUrlMock,
      });
      expect(uploadService.uploadFile).toHaveBeenCalled();
      expect(prisma.space.update).toHaveBeenCalled();
    });

    it('profile user not own', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new ForbiddenException(),
      );

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).rejects.toThrow(ForbiddenException);
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.space.update).not.toHaveBeenCalled();
    });

    it('profile not joined space', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      (profileSpaceService.isProfileInSpace as jest.Mock).mockResolvedValue(
        false,
      );

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).rejects.toThrow(ForbiddenException);
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.space.update).not.toHaveBeenCalled();
    });

    it('profile not found', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).rejects.toThrow(NotFoundException);
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.space.update).not.toHaveBeenCalled();
    });

    it('update fail', async () => {
      const updateSpaceDto = { name: 'new space name' } as UpdateSpacePrismaDto;

      (prisma.space.update as jest.Mock).mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        }),
      );

      const space = spacesService.updateSpace(
        userUuid,
        profileUuid,
        spaceUuid,
        iconMock,
        updateSpaceDto,
      );

      await expect(space).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinSpace', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';
    const space = { uuid: spaceUuid } as Space;

    beforeEach(() => {
      jest
        .spyOn(spacesService, 'findSpaceBySpaceUuid')
        .mockResolvedValue(space);
    });

    it('join space', async () => {
      const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).resolves.toEqual(space);
    });

    it('profile not found', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('profile user not own', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new ForbiddenException(),
      );

      const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(ForbiddenException);
    });

    it('conflict', async () => {
      (profileSpaceService.createProfileSpace as jest.Mock).mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2002',
          clientVersion: '',
        }),
      );

      const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(ConflictException);
    });

    it('space not found', async () => {
      (profileSpaceService.createProfileSpace as jest.Mock).mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2003',
          clientVersion: '',
        }),
      );

      const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(ForbiddenException);
    });
  });

  describe('leaveSpace', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    beforeEach(() => {
      jest.spyOn(spacesService, 'deleteSpace').mockResolvedValue(null);
    });

    it('leave space', async () => {
      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).resolves.toBeUndefined();
      expect(spacesService.deleteSpace).toHaveBeenCalled();
    });

    it('leave space, other profile exist', async () => {
      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      (profileSpaceService.isSpaceEmpty as jest.Mock).mockResolvedValue(false);

      await expect(res).resolves.toBeUndefined();
      expect(spacesService.deleteSpace).not.toHaveBeenCalled();
    });

    it('space delete fail', async () => {
      jest.spyOn(spacesService, 'deleteSpace').mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        }),
      );

      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).resolves.toBeUndefined();
    });

    it('profile not found', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('profile user not own', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new ForbiddenException(),
      );

      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(ForbiddenException);
    });

    it('profile not joined space', async () => {
      (profileSpaceService.deleteProfileSpace as jest.Mock).mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '',
        }),
      );

      const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

      await expect(res).rejects.toThrow(NotFoundException);
    });
  });

  describe('findProfilesInSpace', () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    it('profile not found', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const res = spacesService.findProfilesInSpace(
        userUuid,
        profileUuid,
        spaceUuid,
      );

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('profile user not own', async () => {
      (profilesService.verifyUserProfile as jest.Mock).mockRejectedValue(
        new ForbiddenException(),
      );

      const res = spacesService.findProfilesInSpace(
        userUuid,
        profileUuid,
        spaceUuid,
      );

      await expect(res).rejects.toThrow(ForbiddenException);
    });

    it('profile not joined space', async () => {
      (profileSpaceService.isProfileInSpace as jest.Mock).mockResolvedValue(
        false,
      );

      const res = spacesService.findProfilesInSpace(
        userUuid,
        profileUuid,
        spaceUuid,
      );

      await expect(res).rejects.toThrow(ForbiddenException);
    });
  });
});
