import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

import type { UpdateProfileDto } from './dto/update-profile.dto';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: ProfilesService, useValue: {} }],
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

      profilesService.findProfileByUserUuid = jest.fn(async () => testProfile);

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
  });

  describe('update', () => {
    const imageMock = {} as Express.Multer.File;
    const profileUuidMock = 'profile uuid';
    const bodyMock = {
      nickname: 'test nickname',
    } as UpdateProfileDto;

    it('updated profile', async () => {
      const testProfile = {
        uuid: profileUuidMock,
        userUuid: 'user uuid',
        image: 'www.test.com/image',
        nickname: 'test nickname',
      };

      profilesService.updateProfile = jest.fn(async () => testProfile);

      const response = controller.updateProfile(
        imageMock,
        profileUuidMock,
        bodyMock,
      );

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testProfile,
      });
      expect(profilesService.updateProfile).toHaveBeenCalledWith(
        profileUuidMock,
        imageMock,
        bodyMock,
      );
    });
  });
});
