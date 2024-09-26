import { Test, TestingModule } from '@nestjs/testing';
import { SpacesControllerV2 } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UploadService } from '../upload/upload.service';
import { ProfilesService } from '../profiles/profiles.service';
import { Profile, Space } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { RequestWithUser } from '../utils/interface';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('SpacesControllerV2', () => {
  let controller: SpacesControllerV2;
  let spacesService: SpacesService;
  let uploadService: UploadService;
  let profilesService: ProfilesService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [SpacesControllerV2],
      providers: [
        {
          provide: SpacesService,
          useValue: {
            createSpace: jest.fn(),
            findSpace: jest.fn(),
            updateSpace: jest.fn(),
          },
        },
        { provide: UploadService, useValue: { uploadFile: jest.fn() } },
        { provide: ProfileSpaceService, useValue: { joinSpace: jest.fn() } },
        { provide: ProfilesService, useValue: { findProfile: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SpacesControllerV2>(SpacesControllerV2);
    spacesService = module.get<SpacesService>(SpacesService);
    uploadService = module.get<UploadService>(UploadService);
    profilesService = module.get<ProfilesService>(ProfilesService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('create created', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as CreateSpaceDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = { uuid: 'profile uuid' } as Profile;
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(profilesService, 'findProfile').mockResolvedValue(profileMock);
    jest
      .spyOn(uploadService, 'uploadFile')
      .mockResolvedValue('www.test.com/image');
    jest.spyOn(spacesService, 'createSpace').mockResolvedValue(spaceMock);

    const response = controller.create(iconMock, bodyMock, requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 201,
      message: 'Created',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(spacesService.createSpace).toHaveBeenCalledWith({
      name: bodyMock.name,
      icon: 'www.test.com/image',
    });
  });

  it('create not found profile', async () => {
    const bodyMock = { name: 'new space name' } as CreateSpaceDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    jest.spyOn(profilesService, 'findProfile').mockResolvedValue(null);

    const response = controller.create(
      null as unknown as Express.Multer.File,
      bodyMock,
      requestMock,
    );

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('create icon not requested', async () => {
    const bodyMock = { name: 'new space name' } as CreateSpaceDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = { uuid: 'profile uuid' } as Profile;
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(profilesService, 'findProfile').mockResolvedValue(profileMock);
    jest.spyOn(spacesService, 'createSpace').mockResolvedValue(spaceMock);

    const response = controller.create(
      null as unknown as Express.Multer.File,
      bodyMock,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: 201,
      message: 'Created',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(spacesService.createSpace).toHaveBeenCalledWith({
      ...bodyMock,
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

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: spaceMock,
    });
  });

  it("findOne profile user doesn't have", async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(ForbiddenException);
  });

  it('findOne profile not joined space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: requestMock.user.uuid,
    } as Profile;

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

    const response = controller.findOne(
      spaceMock.uuid,
      profileMock.uuid,
      requestMock,
    );

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('update update space', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceDto;
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(spacesService, 'updateSpace').mockResolvedValue(spaceMock);
    jest
      .spyOn(uploadService, 'uploadFile')
      .mockResolvedValue('www.test.com/image');

    const response = controller.update(iconMock, 'space uuid', bodyMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
  });

  it('update icon not requested', async () => {
    const bodyMock = { name: 'new space name' } as UpdateSpaceDto;
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(spacesService, 'updateSpace').mockResolvedValue(spaceMock);

    const response = controller.update(
      null as unknown as Express.Multer.File,
      'space uuid',
      bodyMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
  });

  it('update fail', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceDto;
    jest.spyOn(spacesService, 'updateSpace').mockResolvedValue(null);

    const response = controller.update(iconMock, 'space uuid', bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
