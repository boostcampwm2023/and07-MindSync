import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InviteCode, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from '../config/magic-number';
import generateUuid from '../utils/uuid';
import { checkExpiry, getExpiryDate } from '../utils/date';
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
      this.deleteInviteCode(inviteCode);
      throw new HttpException('Invite code has expired.', HttpStatus.GONE);
    }
    return this.spacesService.findSpaceBySpaceUuid(inviteCodeData.spaceUuid);
  }

  async createInviteCode(spaceUuid: string): Promise<InviteCode> {
    const space = await this.spacesService.findSpaceBySpaceUuid(spaceUuid);
    if (!space) throw new NotFoundException();
    return this.prisma.inviteCode.create({
      data: {
        uuid: generateUuid(),
        inviteCode: await this.generateUniqueInviteCode(INVITE_CODE_LENGTH),
        spaceUuid: spaceUuid,
        expiryDate: getExpiryDate({ hour: INVITE_CODE_EXPIRY_HOURS }),
      },
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
    let inviteCode: string;
    let inviteCodeData: InviteCode | null;

    do {
      inviteCode = this.generateShortInviteCode(length);
      inviteCodeData = await this.findInviteCode(inviteCode);
    } while (inviteCodeData !== null);

    return inviteCode;
  }
}
