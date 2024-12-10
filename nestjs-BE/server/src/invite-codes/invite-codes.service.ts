import {
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InviteCode, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from '../config/constants';
import { checkExpiry, getExpiryDate } from '../utils/date';
import { SpacesService } from '../spaces/spaces.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';

@Injectable()
export class InviteCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
    private readonly profileSpaceService: ProfileSpaceService,
  ) {}

  async findInviteCode(inviteCode: string): Promise<InviteCode | null> {
    return this.prisma.inviteCode.findUnique({
      where: { inviteCode: inviteCode },
    });
  }

  async findSpace(inviteCode: string) {
    const inviteCodeData = await this.findInviteCode(inviteCode);
    if (!inviteCodeData) throw new NotFoundException();
    if (checkExpiry(inviteCodeData.expiryDate)) {
      await this.deleteInviteCode(inviteCode);
      throw new GoneException('Invite code has expired.');
    }
    return this.spacesService.findSpaceBySpaceUuid(inviteCodeData.spaceUuid);
  }

  async createInviteCode(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<InviteCode> {
    const isProfileInSpace = await this.profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );
    if (!isProfileInSpace) {
      throw new ForbiddenException();
    }
    return this.prisma.inviteCode.create({
      data: {
        uuid: uuid(),
        inviteCode: await this.generateUniqueInviteCode(INVITE_CODE_LENGTH),
        spaceUuid: spaceUuid,
        expiryDate: getExpiryDate({ hour: INVITE_CODE_EXPIRY_HOURS }),
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteExpiredInviteCode() {
    await this.prisma.inviteCode.deleteMany({
      where: { expiryDate: { lt: new Date() } },
    });
  }

  async deleteInviteCode(inviteCode: string): Promise<InviteCode | null> {
    try {
      return await this.prisma.inviteCode.delete({
        where: {
          inviteCode: inviteCode,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  private generateShortInviteCode(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let inviteCode = '';
    for (let i = 0; i < length; i++) {
      inviteCode += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return inviteCode;
  }

  private async generateUniqueInviteCode(length: number): Promise<string> {
    return this.prisma.$transaction(async () => {
      let inviteCode: string;
      let inviteCodeData: InviteCode | null;

      do {
        inviteCode = this.generateShortInviteCode(length);
        inviteCodeData = await this.findInviteCode(inviteCode);
      } while (inviteCodeData !== null);

      return inviteCode;
    });
  }
}
