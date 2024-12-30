import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InviteCode, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from '../config/constants';
import { checkExpiry, getExpiryDate } from '../utils/date';
import { generateRandomString } from '../utils/random-string';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class InviteCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
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

  async createInviteCode(spaceUuid: string): Promise<InviteCode> {
    let inviteCode: InviteCode;
    const newUuid = uuid();

    do {
      try {
        inviteCode = await this.prisma.inviteCode.create({
          data: {
            uuid: newUuid,
            inviteCode: generateRandomString(INVITE_CODE_LENGTH),
            spaceUuid,
            expiryDate: getExpiryDate({ hour: INVITE_CODE_EXPIRY_HOURS }),
          },
        });
      } catch (err) {
        if (err.code !== 'P2002') throw err;
      }
    } while (!inviteCode);

    return inviteCode;
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

  private async generateUniqueInviteCode(length: number): Promise<string> {
    return this.prisma.$transaction(async () => {
      let inviteCode: string;
      let inviteCodeData: InviteCode | null;

      do {
        inviteCode = generateRandomString(length);
        inviteCodeData = await this.findInviteCode(inviteCode);
      } while (inviteCodeData !== null);

      return inviteCode;
    });
  }
}
