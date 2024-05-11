import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { BaseService } from 'src/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
import {
  INVITE_CODE_CACHE_SIZE,
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from 'src/config/magic-number';
import { SpacesService } from 'src/spaces/spaces.service';
import { ResponseUtils } from 'src/utils/response';

export interface InviteCodeData extends CreateInviteCodeDto {
  uuid?: string;
  invite_code: string;
  expiry_date: Date;
}

@Injectable()
export class InviteCodesService extends BaseService<InviteCodeData> {
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
    protected spacesService: SpacesService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: INVITE_CODE_CACHE_SIZE,
      className: 'INVITE_CODE_TB',
      field: 'invite_code',
    });
  }

  generateKey(data: InviteCodeData): string {
    return data.invite_code;
  }

  async createCode(createInviteCodeDto: CreateInviteCodeDto) {
    const { space_uuid: spaceUuid } = createInviteCodeDto;
    await this.spacesService.findSpace(spaceUuid);
    const inviteCodeData = await this.generateInviteCode(createInviteCodeDto);
    super.create(inviteCodeData);
    const { invite_code } = inviteCodeData;
    return ResponseUtils.createResponse(HttpStatus.CREATED, { invite_code });
  }

  async findSpace(inviteCode: string) {
    const inviteCodeData = await this.getInviteCodeData(inviteCode);
    this.checkExpiry(inviteCode, inviteCodeData.expiry_date);
    return this.spacesService.findSpace(inviteCodeData.space_uuid);
  }

  private async generateInviteCode(createInviteCodeDto: CreateInviteCodeDto) {
    const uniqueInviteCode =
      await this.generateUniqueInviteCode(INVITE_CODE_LENGTH);
    const expiryDate = this.calculateExpiryDate();

    return {
      ...createInviteCodeDto,
      invite_code: uniqueInviteCode,
      expiry_date: expiryDate,
    };
  }

  private calculateExpiryDate(): Date {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setHours(currentDate.getHours() + INVITE_CODE_EXPIRY_HOURS);
    return expiryDate;
  }

  private async getInviteCodeData(inviteCode: string) {
    const inviteCodeResponse = await super.findOne(inviteCode);
    const { data: inviteCodeData } = inviteCodeResponse;
    return inviteCodeData;
  }

  private checkExpiry(inviteCode: string, expiryDate: Date) {
    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = new Date(expiryDate).getTime();
    if (expiryTimestamp < currentTimestamp) {
      super.remove(inviteCode);
      throw new HttpException('Invite code has expired.', HttpStatus.GONE);
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
    let inviteCodeData: InviteCodeData;

    do {
      inviteCode = this.generateShortInviteCode(length);
      inviteCodeData = await super.getDataFromCacheOrDB(inviteCode);
    } while (inviteCodeData !== null);

    return inviteCode;
  }
}
