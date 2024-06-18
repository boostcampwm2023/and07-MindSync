import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UploadService } from '../upload/upload.service';
import { RequestWithUser } from '../utils/interface';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: DeepMockProxy<ProfilesService>;
  let uploadService: DeepMockProxy<UploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, UploadService],
    })
      .overrideProvider(ProfilesService)
      .useValue(mockDeep<ProfilesService>())
      .overrideProvider(UploadService)
      .useValue(mockDeep<UploadService>())
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profilesService = module.get(ProfilesService);
    uploadService = module.get(UploadService);
  });

  it('findProfile found profile', async () => {
    const requestMock = { user: { uuid: 'user test uuid' } } as RequestWithUser;
    const testProfile = {
      uuid: 'profile test uuid',
      user_id: requestMock.user.uuid,
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    profilesService.findProfile.mockResolvedValue(testProfile);

    const response = controller.findProfile(requestMock);

    await expect(response).resolves.toEqual({
      statusCode: 200,
      message: 'Success',
      data: testProfile,
    });
    expect(profilesService.findProfile).toHaveBeenCalledWith(
      requestMock.user.uuid,
    );
  });

  it('findProfile not found profile', async () => {
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;
    profilesService.findProfile.mockResolvedValue(null);

    const response = controller.findProfile(requestMock);

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
      user_id: requestMock.user.uuid,
      image: 'www.test.com/image',
      nickname: 'test nickname',
    };
    uploadService.uploadFile.mockResolvedValue(testImageUrl);
    profilesService.updateProfile.mockResolvedValue(testProfile);

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
    uploadService.uploadFile.mockResolvedValue(testImageUrl);
    profilesService.updateProfile.mockResolvedValue(null);

    const response = controller.update(imageMock, requestMock, bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
