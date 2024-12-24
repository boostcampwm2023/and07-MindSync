import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile, Space } from '@prisma/client';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { MatchUserProfileGuard } from '../auth/guards/match-user-profile.guard';
import { IsProfileInSpaceGuard } from '../auth/guards/is-profile-in-space.guard';
import { ProfilesService } from '../profiles/profiles.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: SpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        { provide: SpacesService, useValue: {} },
        { provide: ProfilesService, useValue: {} },
        { provide: ProfileSpaceService, useValue: {} },
        MatchUserProfileGuard,
        IsProfileInSpaceGuard,
      ],
    }).compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get<SpacesService>(SpacesService);
  });

  describe('createSpace', () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const userUuidMock = 'user uuid';
    const profileMock = {
      uuid: 'profile uuid',
      userUuid: userUuidMock,
    } as Profile;
    const bodyMock = {
      name: 'new space name',
      profileUuid: profileMock.uuid,
    } as CreateSpaceDto;
    const spaceMock = { uuid: 'space uuid' } as Space;

    it('created', async () => {
      spacesService.createSpace = jest.fn(async () => spaceMock);

      const response = controller.createSpace(iconMock, bodyMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Created',
        data: spaceMock,
      });
      expect(spacesService.createSpace).toHaveBeenCalledWith(
        iconMock,
        bodyMock,
      );
    });
  });

  describe('findOne', () => {
    const spaceMock = { uuid: 'space uuid' } as Space;

    beforeEach(() => {
      spacesService.findSpace = jest.fn(async () => spaceMock);
    });

    it('found space', async () => {
      const response = controller.findSpace(spaceMock.uuid);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: spaceMock,
      });
    });

    it('space not found', async () => {
      (spacesService.findSpace as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const response = controller.findSpace(spaceMock.uuid);

      await expect(response).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSpace', () => {
    const spaceUuid = 'space uuid';
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceDto;
    const spaceMock = { uuid: spaceUuid } as Space;

    beforeEach(() => {
      spacesService.updateSpace = jest.fn(async () => spaceMock);
    });

    it('update space', async () => {
      const response = controller.updateSpace(iconMock, spaceUuid, bodyMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: spaceMock,
      });
    });

    it('space not found', async () => {
      (spacesService.updateSpace as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const response = controller.updateSpace(iconMock, spaceUuid, bodyMock);

      await expect(response).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinSpace', () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    const profileUuidMock = 'profile uuid';

    beforeEach(() => {
      spacesService.joinSpace = jest.fn(async () => spaceMock);
    });

    it('join space', async () => {
      const response = controller.joinSpace(spaceMock.uuid, profileUuidMock);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Created',
        data: spaceMock,
      });
    });
  });

  describe('leaveSpace', () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };

    beforeEach(() => {
      spacesService.leaveSpace = jest.fn(async () => undefined);
    });

    it('leave space', async () => {
      const response = controller.leaveSpace(spaceMock.uuid, profileMock.uuid);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
      });
    });
  });

  describe('findProfilesInSpace', () => {
    const spaceMock = { uuid: 'space uuid' };
    const profilesMock = [];

    beforeEach(() => {
      spacesService.findProfilesInSpace = jest.fn(async () => profilesMock);
    });

    it('get profiles', async () => {
      const response = controller.findProfilesInSpace(spaceMock.uuid);

      await expect(response).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: profilesMock,
      });
    });
  });
});
