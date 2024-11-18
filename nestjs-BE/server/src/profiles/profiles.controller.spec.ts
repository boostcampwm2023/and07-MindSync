import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: ProfilesService;

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
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profilesService = module.get<ProfilesService>(ProfilesService);
  });

  describe('findProfile', () => {
    const userUuidMock = 'user uuid';

    it('found profile', async () => {
      const testProfile = {
        uuid: 'profile test uuid',
        userUuid: userUuidMock,
        image: 'www.test.com/image',
        nickname: 'test nickname',
      };

      jest
        .spyOn(profilesService, 'findProfileByUserUuid')
        .mockResolvedValue(testProfile);

      const response = controller.findProfileByUserUuid(userUuidMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testProfile,
      });
      expect(profilesService.findProfileByUserUuid).toHaveBeenCalledWith(
        userUuidMock,
      );
    });

    it('not found profile', async () => {
      jest
        .spyOn(profilesService, 'findProfileByUserUuid')
        .mockRejectedValue(new NotFoundException());

      const response = controller.findProfileByUserUuid(userUuidMock);

      await expect(response).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const imageMock = {} as Express.Multer.File;
    const userUuidMock = 'user uuid';
    const bodyMock = {
      uuid: 'profile test uuid',
      nickname: 'test nickname',
    };

    it('updated profile', async () => {
      const testProfile = {
        uuid: 'profile test uuid',
        userUuid: userUuidMock,
        image: 'www.test.com/image',
        nickname: 'test nickname',
      };

      jest
        .spyOn(profilesService, 'updateProfile')
        .mockResolvedValue(testProfile);

      const response = controller.updateProfile(
        imageMock,
        userUuidMock,
        bodyMock,
      );

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testProfile,
      });
      expect(profilesService.updateProfile).toHaveBeenCalledWith(
        userUuidMock,
        bodyMock.uuid,
        imageMock,
        bodyMock,
      );
    });

    it('not found user', async () => {
      jest
        .spyOn(profilesService, 'updateProfile')
        .mockRejectedValue(new ForbiddenException());

      const response = controller.updateProfile(
        imageMock,
        userUuidMock,
        bodyMock,
      );

      await expect(response).rejects.toThrow(ForbiddenException);
    });
  });
});
