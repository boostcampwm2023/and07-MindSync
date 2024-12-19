import {
  ForbiddenException,
  GoneException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InviteCode, Space } from '@prisma/client';
import { InviteCodesController } from './invite-codes.controller';
import { InviteCodesService } from './invite-codes.service';
import { MatchUserProfileGuard } from '../auth/guards/match-user-profile.guard';
import { ProfilesService } from '../profiles/profiles.service';
import { IsProfileInSpaceGuard } from '../auth/guards/is-profile-in-space.guard';
import { ProfileSpaceService } from '../profile-space/profile-space.service';

describe('InviteCodesController', () => {
  let controller: InviteCodesController;
  let inviteCodesService: InviteCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteCodesController],
      providers: [
        { provide: InviteCodesService, useValue: {} },
        { provide: ProfilesService, useValue: {} },
        { provide: ProfileSpaceService, useValue: {} },
        MatchUserProfileGuard,
        IsProfileInSpaceGuard,
      ],
    }).compile();

    controller = module.get<InviteCodesController>(InviteCodesController);
    inviteCodesService = module.get<InviteCodesService>(InviteCodesService);
  });

  describe('createInviteCode', () => {
    const testSpaceUuid = 'test space uuid';
    const testInviteCode: InviteCode = {
      inviteCode: 'test invite code',
    } as InviteCode;

    beforeEach(() => {
      inviteCodesService.createInviteCode = jest.fn(async () => testInviteCode);
    });

    it('success', async () => {
      const inviteCode = controller.createInviteCode(testSpaceUuid);

      await expect(inviteCode).resolves.toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Created',
        data: { invite_code: testInviteCode.inviteCode },
      });
    });

    it('profile not in space', async () => {
      (inviteCodesService.createInviteCode as jest.Mock).mockRejectedValue(
        new ForbiddenException(),
      );

      const inviteCode = controller.createInviteCode(testSpaceUuid);

      await expect(inviteCode).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findSpace', () => {
    const testInviteCode = 'test invite code';
    const testSpace: Space = {
      uuid: 'test uuid',
      name: 'test space',
      icon: 'test icon',
    };

    beforeEach(() => {
      (inviteCodesService.findSpace as jest.Mock) = jest.fn(
        async () => testSpace,
      );
    });

    it('success', async () => {
      const space = controller.findSpace(testInviteCode);

      await expect(space).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: testSpace,
      });
    });

    it('invite code not found', async () => {
      (inviteCodesService.findSpace as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      const space = controller.findSpace(testInviteCode);

      await expect(space).rejects.toThrow(NotFoundException);
    });

    it('invite code expired', async () => {
      (inviteCodesService.findSpace as jest.Mock).mockRejectedValue(
        new GoneException(),
      );

      const space = controller.findSpace(testInviteCode);

      await expect(space).rejects.toThrow(GoneException);
    });
  });
});
