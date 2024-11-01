import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { RequestWithUser } from '../utils/interface';

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
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;

    it('found profile', async () => {
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
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testProfile,
      });
      expect(profilesService.findProfileByUserUuid).toHaveBeenCalledWith(
        requestMock.user.uuid,
      );
    });

    it('not found profile', async () => {
      jest
        .spyOn(profilesService, 'findProfileByUserUuid')
        .mockResolvedValue(null);

      const response = controller.findProfileByUserUuid(requestMock);

      await expect(response).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const imageMock = {} as Express.Multer.File;
    const requestMock = { user: { uuid: 'test uuid' } } as RequestWithUser;
    const bodyMock = {
      uuid: 'profile test uuid',
      nickname: 'test nickname',
    };

    it('updated profile', async () => {
      const testProfile = {
        uuid: 'profile test uuid',
        userUuid: requestMock.user.uuid,
        image: 'www.test.com/image',
        nickname: 'test nickname',
      };

      jest
        .spyOn(profilesService, 'updateProfile')
        .mockResolvedValue(testProfile);

      const response = controller.updateProfile(
        imageMock,
        requestMock,
        bodyMock,
      );

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testProfile,
      });
      expect(profilesService.updateProfile).toHaveBeenCalledWith(
        requestMock.user.uuid,
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
        requestMock,
        bodyMock,
      );

      await expect(response).rejects.toThrow(ForbiddenException);
    });
  });
});
