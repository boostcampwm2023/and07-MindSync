import { GoneException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Space } from '@prisma/client';
import { InviteCodesController } from './invite-codes.controller';
import { InviteCodesService } from './invite-codes.service';

describe('InviteCodesController', () => {
  let controller: InviteCodesController;
  let inviteCodesService: InviteCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteCodesController],
      providers: [{ provide: InviteCodesService, useValue: {} }],
    }).compile();

    controller = module.get<InviteCodesController>(InviteCodesController);
    inviteCodesService = module.get<InviteCodesService>(InviteCodesService);
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
