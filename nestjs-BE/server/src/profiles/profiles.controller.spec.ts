import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UploadService } from '../upload/upload.service';
import { RequestWithUser } from '../utils/interface';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: ProfilesService;
  let uploadService: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: {
            findProfileByUserUuid: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
        { provide: UploadService, useValue: { uploadFile: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profilesService = module.get<ProfilesService>(ProfilesService);
    uploadService = module.get<UploadService>(UploadService);
  });

  it('findProfile found profile', async () => {
    const requestMock = { user: { uuid: 'user test uuid' } } as RequestWithUser;
    const testProfile = {
      uuid: 'profile test uuid',
      userUuid: requestMock.user.uuid,
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    jest
      .spyOn(profilesService, 'findProfileByUserUuid')
      .mockResolvedValue(testProfile);

    const response = controller.findProfileByUserUuid(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: testProfile,
    });
    expect(profilesService.findProfileByUserUuid).toHaveBeenCalledWith(
      requestMock.user.uuid,
    );
  });

  it('findProfile not found profile', async () => {
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;
    jest
      .spyOn(profilesService, 'findProfileByUserUuid')
      .mockResolvedValue(null);

    const response = controller.findProfileByUserUuid(requestMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('update updated profile', async () => {
    const imageMock = {} as Express.Multer.File;
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;
    const bodyMock = {
      nickname: 'test nickname',
    };
    const testImageUrl = 'www.test.com/image';
    const testProfile = {
      uuid: 'profile test uuid',
      userUuid: requestMock.user.uuid,
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    jest.spyOn(uploadService, 'uploadFile').mockResolvedValue(testImageUrl);
    jest.spyOn(profilesService, 'updateProfile').mockResolvedValue(testProfile);

    const response = controller.update(imageMock, requestMock, bodyMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: testProfile,
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(uploadService.uploadFile).toHaveBeenCalledWith(imageMock);
    expect(profilesService.updateProfile).toHaveBeenCalledWith(
      requestMock.user.uuid,
      { nickname: bodyMock.nickname, image: testImageUrl },
    );
  });

  it('update not found user', async () => {
    const imageMock = {} as Express.Multer.File;
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;
    const bodyMock = {
      nickname: 'test nickname',
    };
    const testImageUrl = 'www.test.com/image';
    jest.spyOn(uploadService, 'uploadFile').mockResolvedValue(testImageUrl);
    jest.spyOn(profilesService, 'updateProfile').mockResolvedValue(null);

    const response = controller.update(imageMock, requestMock, bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
