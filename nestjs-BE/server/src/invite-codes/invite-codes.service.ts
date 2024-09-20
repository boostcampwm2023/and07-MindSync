import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from '../config/magic-number';
import { InviteCode, Prisma } from '@prisma/client';
import generateUuid from '../utils/uuid';

@Injectable()
export class InviteCodesService {
  constructor(protected prisma: PrismaService) {}

  async findInviteCode(inviteCode: string): Promise<InviteCode> {
    return this.prisma.inviteCode.findUnique({
      where: { invite_code: inviteCode },
    });
  }

  async createInviteCode(spaceUuid: string): Promise<InviteCode> {
    return this.prisma.inviteCode.create({
      data: {
        uuid: generateUuid(),
        invite_code: await this.generateUniqueInviteCode(INVITE_CODE_LENGTH),
        space_uuid: spaceUuid,
        expiry_date: this.calculateExpiryDate(),
      },
    });
  }

  async deleteInviteCode(inviteCode: string): Promise<InviteCode> {
    try {
      return await this.prisma.inviteCode.delete({
        where: {
          invite_code: inviteCode,
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

  private calculateExpiryDate(): Date {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setHours(currentDate.getHours() + INVITE_CODE_EXPIRY_HOURS);
    return expiryDate;
  }

  checkExpiry(expiryDate: Date) {
    const currentTimestamp = new Date();
    return expiryDate < currentTimestamp ? true : false;
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
    let inviteCode: string;
    let inviteCodeData: InviteCode;

    do {
      inviteCode = this.generateShortInviteCode(length);
      inviteCodeData = await this.findInviteCode(inviteCode);
    } while (inviteCodeData !== null);

    return inviteCode;
  }
}
