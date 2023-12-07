import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { BaseService } from 'src/base/base.service';
import { PrismaServiceMySQL } from 'src/prisma/prisma.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
import {
  INVITE_CODE_CACHE_SIZE,
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from 'src/config/magic-number';
import { SpacesService } from 'src/spaces/spaces.service';

export interface InviteCodeData extends CreateInviteCodeDto {
  uuid?: string;
  invite_code: string;
  expiry_date: Date;
}

@Injectable()
export class InviteCodesService extends BaseService<InviteCodeData> {
  constructor(
    protected prisma: PrismaServiceMySQL,
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
    const inviteCode = await this.generateUniqueInviteCode(INVITE_CODE_LENGTH);
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setHours(currentDate.getHours() + INVITE_CODE_EXPIRY_HOURS);
    const data: InviteCodeData = {
      ...createInviteCodeDto,
      invite_code: inviteCode,
      expiry_date: expiryDate,
    };
    const { space_uuid: spaceUuid } = createInviteCodeDto;
    const space = await this.spacesService.getDataFromCacheOrDB(spaceUuid);
    if (!space) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    super.create(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: { invite_code: inviteCode },
    };
  }

  async findSpace(inviteCode: string) {
    const inviteCodeData = await super.getDataFromCacheOrDB(inviteCode);
    if (!inviteCodeData) {
      throw new HttpException('Invalid invite code.', HttpStatus.NOT_FOUND);
    }
    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = new Date(inviteCodeData.expiry_date).getTime();
    if (expiryTimestamp < currentTimestamp) {
      super.remove(inviteCode);
      throw new HttpException(
        'Invite code has expired.',
        HttpStatus.GONE,
      );
    }
    const spaceUuid = inviteCodeData.space_uuid;
    const spaceData = await this.spacesService.getDataFromCacheOrDB(spaceUuid);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: spaceData,
    };
  }

  generateShortInviteCode(length: number) {
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

  async generateUniqueInviteCode(length: number): Promise<string> {
    let inviteCode: string;
    let inviteCodeData: InviteCodeData;

    do {
      inviteCode = this.generateShortInviteCode(length);
      inviteCodeData = await super.getDataFromCacheOrDB(inviteCode);
    } while (inviteCodeData !== null);

    return inviteCode;
  }
}
