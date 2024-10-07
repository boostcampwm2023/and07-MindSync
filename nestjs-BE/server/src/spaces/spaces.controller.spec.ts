import { Test, TestingModule } from '@nestjs/testing';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UploadService } from '../upload/upload.service';
import { Profile, Space } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSpaceRequestDto } from './dto/update-space.dto';
import { CreateSpaceRequestDto } from './dto/create-space.dto';
import { RequestWithUser } from '../utils/interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: SpacesService;
  let uploadService: UploadService;
  let configService: ConfigService;
  let profileSpaceService: ProfileSpaceService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [SpacesController],
      providers: [
        {
          provide: SpacesService,
          useValue: {
            createSpace: jest.fn(),
            findSpace: jest.fn(),
            updateSpace: jest.fn(),
            joinSpace: jest.fn(),
            leaveSpace: jest.fn(),
            findProfilesInSpace: jest.fn(),
          },
        },
        { provide: UploadService, useValue: { uploadFile: jest.fn() } },
        {
          provide: ProfileSpaceService,
          useValue: {
            findProfileSpaceByBothUuid: jest.fn(),
            joinSpace: jest.fn(),
          },
        },
        { provide: UsersService, useValue: { verifyUserProfile: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get<SpacesService>(SpacesService);
    uploadService = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
    profileSpaceService = module.get<ProfileSpaceService>(ProfileSpaceService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('create created', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const iconUrlMock = 'www.test.com/image';
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const bodyMock = {
      name: 'new space name',
      profileUuid: profileMock.uuid,
    } as CreateSpaceRequestDto;
    const spaceMock = { uuid: 'space uuid' } as Space;

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (uploadService.uploadFile as jest.Mock).mockResolvedValue(iconUrlMock);
    (spacesService.createSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.create(iconMock, bodyMock, requestMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(spacesService.createSpace).toHaveBeenCalledWith({
      name: bodyMock.name,
      profileUuid: bodyMock.profileUuid,
      icon: iconUrlMock,
    });
  });

  it('create not found profile', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = {
      name: 'new space name',
      profileUuid: 'wrong profile uuid',
    } as CreateSpaceRequestDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );

    const response = controller.create(iconMock, bodyMock, requestMock);

    await expect(response).rejects.toThrow(NotFoundException);
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.createSpace).not.toHaveBeenCalled();
  });

  it("create profile user doesn't have", async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: 'wrong user uuid',
    } as Profile;
    const bodyMock = {
      name: 'new space name',
      profileUuid: profileMock.uuid,
    } as CreateSpaceRequestDto;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );

    const response = controller.create(iconMock, bodyMock, requestMock);

    await expect(response).rejects.toThrow(ForbiddenException);
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.createSpace).not.toHaveBeenCalledWith();
  });

  it('create icon not requested', async () => {
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const bodyMock = {
      name: 'new space name',
      profileUuid: profileMock.uuid,
    } as CreateSpaceRequestDto;
    const spaceMock = { uuid: 'space uuid' } as Space;

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (spacesService.createSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.create(
      null as unknown as Express.Multer.File,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.createSpace).toHaveBeenCalledWith({
      name: bodyMock.name,
      profileUuid: bodyMock.profileUuid,
      icon: configService.get<string>('APP_ICON_URL'),
    });
  });

  it('findOne found space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const profileSpaceMock = {
      spaceUuid: spaceMock.uuid,
      profileUuid: profileMock.uuid,
    };

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (spacesService.findSpace as jest.Mock).mockResolvedValue(spaceMock);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(profileSpaceMock);

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
  });

  it('findOne profile_uuid missing', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;

    const response = controller.findOne(spaceMock.uuid, undefined, requestMock);

    await expect(response).rejects.toThrow(BadRequestException);
    expect(usersService.verifyUserProfile).not.toHaveBeenCalled();
  });

  it("findOne profile user doesn't have", async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: 'wrong user uuid',
    } as Profile;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(ForbiddenException);
    expect(spacesService.findSpace).not.toHaveBeenCalled();
  });

  it('findOne profile not joined space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (spacesService.findSpace as jest.Mock).mockResolvedValue(spaceMock);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(null);

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(ForbiddenException);
  });

  it('findOne not found space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (spacesService.findSpace as jest.Mock).mockResolvedValue(null);

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('findOne profile not found', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('update update space', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const iconUrlMock = 'www.test.com/image';
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const profileSpaceMock = {
      spaceUuid: spaceMock.uuid,
      profileUuid: profileMock.uuid,
    };

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(profileSpaceMock);
    (uploadService.uploadFile as jest.Mock).mockResolvedValue(iconUrlMock);
    (spacesService.updateSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.update(
      iconMock,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(spacesService.updateSpace).toHaveBeenCalledWith(spaceMock.uuid, {
      name: bodyMock.name,
      icon: iconUrlMock,
    });
  });

  it('update icon not requested', async () => {
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const profileSpaceMock = {
      spaceUuid: spaceMock.uuid,
      profileUuid: profileMock.uuid,
    };

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(profileSpaceMock);
    (spacesService.updateSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.update(
      null as unknown as Express.Multer.File,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.updateSpace).toHaveBeenCalledWith(spaceMock.uuid, {
      name: bodyMock.name,
    });
  });

  it('update name not requested', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const iconUrlMock = 'www.test.com/image';
    const bodyMock = {} as UpdateSpaceRequestDto;
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const profileSpaceMock = {
      spaceUuid: spaceMock.uuid,
      profileUuid: profileMock.uuid,
    };

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(profileSpaceMock);
    (spacesService.updateSpace as jest.Mock).mockResolvedValue(spaceMock);
    (uploadService.uploadFile as jest.Mock).mockResolvedValue(iconUrlMock);

    const response = controller.update(
      iconMock,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(spacesService.updateSpace).toHaveBeenCalledWith(spaceMock.uuid, {
      icon: iconUrlMock,
    });
  });

  it("update profile user doesn't have", async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: 'new user uuid',
    } as Profile;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );

    const response = controller.update(
      iconMock,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).rejects.toThrow(ForbiddenException);
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.updateSpace).not.toHaveBeenCalled();
  });

  it('update profile not joined space', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;

    (usersService.verifyUserProfile as jest.Mock).mockResolvedValue(true);
    (
      profileSpaceService.findProfileSpaceByBothUuid as jest.Mock
    ).mockResolvedValue(null);

    const response = controller.update(
      iconMock,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).rejects.toThrow(ForbiddenException);
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.updateSpace).not.toHaveBeenCalled();
  });

  it('update profile not found', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );

    const response = controller.update(
      iconMock,
      spaceMock.uuid,
      profileMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).rejects.toThrow(NotFoundException);
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.updateSpace).not.toHaveBeenCalled();
  });

  it('joinSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const bodyMock = { profileUuid: 'profile uuid' };
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;

    (spacesService.joinSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.joinSpace(
      spaceMock.uuid,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: spaceMock,
    });
  });

  it('leaveSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;

    (spacesService.leaveSpace as jest.Mock).mockResolvedValue(undefined);

    const response = controller.leaveSpace(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
    });
  });

  it('findProfilesInSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profilesMock = [];

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue(
      profilesMock,
    );

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: profilesMock,
    });
  });

  it('findProfilesInSpace space uuid needed', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue([]);

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      undefined,
      requestMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
  });
});
