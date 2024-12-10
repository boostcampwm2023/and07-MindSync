import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { InviteCode, Space } from '@prisma/client';
import { InviteCodesService } from './invite-codes.service';
import { SpacesService } from '../spaces/spaces.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import * as ExpiryModule from '../utils/date';

describe('InviteCodesService', () => {
  let inviteCodesService: InviteCodesService;
  let prisma: PrismaService;
  let spacesService: SpacesService;
  let profileSpaceService: ProfileSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteCodesService,
        { provide: PrismaService, useValue: { inviteCode: {} } },
        { provide: SpacesService, useValue: {} },
        { provide: ProfileSpaceService, useValue: {} },
      ],
    }).compile();

    inviteCodesService = module.get<InviteCodesService>(InviteCodesService);
    prisma = module.get<PrismaService>(PrismaService);
    spacesService = module.get<SpacesService>(SpacesService);
    profileSpaceService = module.get<ProfileSpaceService>(ProfileSpaceService);
  });

  describe('findSpace', () => {
    const testSpace: Space = {
      uuid: 'test uuid',
      name: 'test space',
      icon: 'test icon',
    };
    const testInviteCode = 'test invite code';
    const testInviteCodeDate = {
      spaceUuid: 'space uuid',
      expiryDate: 'expriy date',
    } as unknown as InviteCode;
    let checkExpirySpy: jest.SpyInstance;
    let deleteInviteCodeSpy: jest.SpyInstance;

    beforeEach(() => {
      jest
        .spyOn(inviteCodesService, 'findInviteCode')
        .mockResolvedValue(testInviteCodeDate);
      checkExpirySpy = jest
        .spyOn(ExpiryModule, 'checkExpiry')
        .mockReturnValue(false);
      deleteInviteCodeSpy = jest
        .spyOn(inviteCodesService, 'deleteInviteCode')
        .mockResolvedValue(null);
      spacesService.findSpaceBySpaceUuid = jest.fn(async () => testSpace);
    });

    afterEach(() => {
      checkExpirySpy.mockRestore();
    });

    it('success', async () => {
      const space = inviteCodesService.findSpace(testInviteCode);

      await expect(space).resolves.toEqual(testSpace);
      expect(deleteInviteCodeSpy).not.toHaveBeenCalled();
    });

    it('invite code not found', async () => {
      jest.spyOn(inviteCodesService, 'findInviteCode').mockResolvedValue(null);

      const space = inviteCodesService.findSpace(testInviteCode);

      await expect(space).rejects.toThrow(NotFoundException);
      expect(checkExpirySpy).not.toHaveBeenCalled();
    });

    it('invite code expired', async () => {
      checkExpirySpy.mockReturnValue(true);

      const space = inviteCodesService.findSpace(testInviteCode);

      await expect(space).rejects.toThrow(GoneException);
      expect(deleteInviteCodeSpy).toHaveBeenCalled();
    });
  });

  describe('createInviteCode', () => {
    const testProfileUuid = 'test profile uuid';
    const testSpaceUuid = 'test space uuid';
    const testInviteCode = { inviteCode: 'test invite code' } as InviteCode;

    beforeEach(() => {
      profileSpaceService.isProfileInSpace = jest.fn(async () => true);
      prisma.$transaction = jest.fn(async () => undefined);
      (prisma.inviteCode.create as jest.Mock) = jest.fn(
        async () => testInviteCode,
      );
    });

    it('space not found', async () => {
      (profileSpaceService.isProfileInSpace as jest.Mock).mockResolvedValue(
        false,
      );

      const inviteCode = inviteCodesService.createInviteCode(
        testProfileUuid,
        testSpaceUuid,
      );

      await expect(inviteCode).rejects.toThrow(ForbiddenException);
      expect(prisma.inviteCode.create).not.toHaveBeenCalled();
    });
  });
});
