import { Test, TestingModule } from '@nestjs/testing';
import { GoneException, NotFoundException } from '@nestjs/common';
import { InviteCode, Space } from '@prisma/client';
import { InviteCodesService } from './invite-codes.service';
import { SpacesService } from '../spaces/spaces.service';
import { PrismaService } from '../prisma/prisma.service';
import * as ExpiryModule from '../utils/date';

describe('InviteCodesService', () => {
  let inviteCodesService: InviteCodesService;
  let prisma: PrismaService;
  let spacesService: SpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteCodesService,
        { provide: PrismaService, useValue: { inviteCode: {} } },
        { provide: SpacesService, useValue: {} },
      ],
    }).compile();

    inviteCodesService = module.get<InviteCodesService>(InviteCodesService);
    prisma = module.get<PrismaService>(PrismaService);
    spacesService = module.get<SpacesService>(SpacesService);
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
    const testSpaceUuid = 'test space uuid';
    const testInviteCode = { inviteCode: 'test invite code' } as InviteCode;

    beforeEach(() => {
      (prisma.$transaction as jest.Mock) = jest.fn(async (callback) =>
        callback(),
      );
      jest.spyOn(inviteCodesService, 'findInviteCode').mockResolvedValue(null);
      (prisma.inviteCode.create as jest.Mock) = jest.fn(
        async () => testInviteCode,
      );
    });

    it('created', async () => {
      const inviteCode = inviteCodesService.createInviteCode(testSpaceUuid);

      await expect(inviteCode).resolves.toEqual(testInviteCode);
      expect(inviteCodesService.findInviteCode).toHaveBeenCalledTimes(1);
    });
  });
});
