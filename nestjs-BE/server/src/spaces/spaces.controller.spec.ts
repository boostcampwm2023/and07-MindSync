import { Test, TestingModule } from '@nestjs/testing';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UploadService } from '../upload/upload.service';
import { ProfilesService } from '../profiles/profiles.service';
import { Profile, Space } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { RequestWithUser } from '../utils/interface';
import customEnv from '../config/env';
const { APP_ICON_URL } = customEnv;

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: DeepMockProxy<SpacesService>;
  let uploadService: DeepMockProxy<UploadService>;
  let profilesService: DeepMockProxy<ProfilesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        SpacesService,
        UploadService,
        ProfileSpaceService,
        ProfilesService,
      ],
    })
      .overrideProvider(SpacesService)
      .useValue(mockDeep<SpacesService>())
      .overrideProvider(UploadService)
      .useValue(mockDeep<UploadService>())
      .overrideProvider(ProfileSpaceService)
      .useValue(mockDeep<ProfileSpaceService>())
      .overrideProvider(ProfilesService)
      .useValue(mockDeep<ProfilesService>())
      .compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get(SpacesService);
    uploadService = module.get(UploadService);
    profilesService = module.get(ProfilesService);
  });

  it('create created', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as CreateSpaceDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    const profileMock = { uuid: 'profile uuid' } as Profile;
    const spaceMock = { uuid: 'space uuid' } as Space;
    profilesService.findProfile.mockResolvedValue(profileMock);
    uploadService.uploadFile.mockResolvedValue('www.test.com/image');
    spacesService.createSpace.mockResolvedValue(spaceMock);

    const response = controller.create(iconMock, bodyMock, requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 201,
      message: 'Created',
      data: spaceMock,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(spacesService.createSpace).toHaveBeenCalledWith({
      ...bodyMock,
      icon: 'www.test.com/image',
    });
  });

  it('create not found profile', async () => {
    const bodyMock = { name: 'new space name' } as CreateSpaceDto;
    const requestMock = { user: { uuid: 'user uuid' } } as RequestWithUser;
    profilesService.findProfile.mockResolvedValue(null);

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
    profilesService.findProfile.mockResolvedValue(profileMock);
    spacesService.createSpace.mockResolvedValue(spaceMock);

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
      icon: APP_ICON_URL,
    });
  });

  it('findOne found space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    spacesService.findSpace.mockResolvedValue(spaceMock);

    const response = controller.findOne('space uuid');

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: spaceMock,
    });
  });

  it('findOne not found space', async () => {
    spacesService.findSpace.mockResolvedValue(null);

    const response = controller.findOne('space uuid');

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('update update space', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceDto;
    const spaceMock = { uuid: 'space uuid' } as Space;
    spacesService.updateSpace.mockResolvedValue(spaceMock);
    uploadService.uploadFile.mockResolvedValue('www.test.com/image');

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
    spacesService.updateSpace.mockResolvedValue(spaceMock);

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
    spacesService.updateSpace.mockResolvedValue(null);

    const response = controller.update(iconMock, 'space uuid', bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
