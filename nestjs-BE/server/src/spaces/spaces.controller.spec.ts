import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile, Space } from '@prisma/client';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { UpdateSpaceRequestDto } from './dto/update-space.dto';
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
        {
          provide: SpacesService,
          useValue: {
            createSpace: jest.fn(),
            updateSpace: jest.fn(),
            joinSpace: jest.fn(),
            leaveSpace: jest.fn(),
            findProfilesInSpace: jest.fn(),
          },
        },
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
      (spacesService.createSpace as jest.Mock).mockResolvedValue(spaceMock);

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

  it('updateSpace update space', async () => {
    const spaceUuid = 'space uuid';
    const profileUuid = 'profile uuid';
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const userUuidMock = 'user uuid';
    const spaceMock = { uuid: spaceUuid } as Space;

    (spacesService.updateSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.updateSpace(
      iconMock,
      spaceUuid,
      profileUuid,
      bodyMock,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: spaceMock,
    });
  });

  it('updateSpace profile uuid needed', async () => {
    const iconMock = { filename: 'icon' } as Express.Multer.File;
    const spaceUuid = 'space uuid';
    const bodyMock = { name: 'new space name' } as UpdateSpaceRequestDto;
    const userUuidMock = 'user uuid';

    const response = controller.updateSpace(
      iconMock,
      spaceUuid,
      undefined,
      bodyMock,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
    expect(spacesService.updateSpace).not.toHaveBeenCalled();
  });

  it('joinSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const bodyMock = { profileUuid: 'profile uuid' };
    const userUuidMock = 'user uuid';

    (spacesService.joinSpace as jest.Mock).mockResolvedValue(spaceMock);

    const response = controller.joinSpace(
      spaceMock.uuid,
      bodyMock,
      userUuidMock,
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
    const userUuidMock = 'user uuid';

    (spacesService.leaveSpace as jest.Mock).mockResolvedValue(undefined);

    const response = controller.leaveSpace(
      spaceMock.uuid,
      profileMock.uuid,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
    });
  });

  it('findProfilesInSpace', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const profileMock = { uuid: 'profile uuid' };
    const userUuidMock = 'user uuid';
    const profilesMock = [];

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue(
      profilesMock,
    );

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      profileMock.uuid,
      userUuidMock,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: profilesMock,
    });
  });

  it('findProfilesInSpace space uuid needed', async () => {
    const spaceMock = { uuid: 'space uuid' };
    const userUuidMock = 'user uuid';

    (spacesService.findProfilesInSpace as jest.Mock).mockResolvedValue([]);

    const response = controller.findProfilesInSpace(
      spaceMock.uuid,
      undefined,
      userUuidMock,
    );

    await expect(response).rejects.toThrow(BadRequestException);
  });
});
