import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SpacesService } from './spaces.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UsersService } from '../users/users.service';

describe('SpacesService', () => {
  let spacesService: SpacesService;
  let prisma: PrismaService;
  let profileSpaceService: ProfileSpaceService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        {
          provide: PrismaService,
          useValue: {
            space: { update: jest.fn() },
            profile: { findMany: jest.fn() },
          },
        },
        {
          provide: ProfileSpaceService,
          useValue: {
            createProfileSpace: jest.fn(),
            deleteProfileSpace: jest.fn(),
            isSpaceEmpty: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: { verifyUserProfile: jest.fn() },
        },
      ],
    }).compile();

    spacesService = module.get<SpacesService>(SpacesService);
    prisma = module.get<PrismaService>(PrismaService);
    profileSpaceService = module.get<ProfileSpaceService>(ProfileSpaceService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('updateSpace updated space', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };
    const spaceMock = { uuid: 'space uuid', ...data };

    (prisma.space.update as jest.Mock).mockResolvedValue(spaceMock);

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('updateSpace fail', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };

    (prisma.space.update as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '',
      }),
    );

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toBeNull();
  });

  it('updateSpace fail', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };

    (prisma.space.update as jest.Mock).mockRejectedValue(new Error());

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).rejects.toThrow(Error);
  });

  it('joinSpace', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).resolves.toBeUndefined();
  });

  it('joinSpace profile not found', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );

    const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(NotFoundException);
  });

  it('joinSpace profile user not own', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );

    const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(ForbiddenException);
  });

  it('joinSpace conflict', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (profileSpaceService.createProfileSpace as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '',
      }),
    );

    const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(ConflictException);
  });

  it('joinSpace space not found', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (profileSpaceService.createProfileSpace as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2003',
        clientVersion: '',
      }),
    );

    const res = spacesService.joinSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(ForbiddenException);
  });

  it('leaveSpace', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    jest.spyOn(spacesService, 'deleteSpace').mockResolvedValue(null);

    const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).resolves.toBeUndefined();
  });

  it('leaveSpace space delete fail', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    jest.spyOn(spacesService, 'deleteSpace').mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '',
      }),
    );

    const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).resolves.toBeUndefined();
  });

  it('leaveSpace profile not found', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );
    jest.spyOn(spacesService, 'deleteSpace').mockResolvedValue(null);

    const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(NotFoundException);
  });

  it('leaveSpace profile user not own', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );
    jest.spyOn(spacesService, 'deleteSpace').mockResolvedValue(null);

    const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(ForbiddenException);
  });

  it('leaveSpace profileSpace not found', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (profileSpaceService.deleteProfileSpace as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '',
      }),
    );
    jest.spyOn(spacesService, 'deleteSpace').mockResolvedValue(null);

    const res = spacesService.leaveSpace(userUuid, profileUuid, spaceUuid);

    await expect(res).rejects.toThrow(NotFoundException);
  });

  it('findProfilesInSpace profile not found', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new NotFoundException(),
    );

    const res = spacesService.findProfilesInSpace(
      userUuid,
      profileUuid,
      spaceUuid,
    );

    await expect(res).rejects.toThrow(NotFoundException);
  });

  it('findProfilesInSpace profile user not own', async () => {
    const userUuid = 'user uuid';
    const profileUuid = 'profile uuid';
    const spaceUuid = 'space uuid';

    (usersService.verifyUserProfile as jest.Mock).mockRejectedValue(
      new ForbiddenException(),
    );

    const res = spacesService.findProfilesInSpace(
      userUuid,
      profileUuid,
      spaceUuid,
    );

    await expect(res).rejects.toThrow(ForbiddenException);
  });
});
