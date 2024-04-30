import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { SPACE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { UpdateProfileDto } from 'src/profiles/dto/update-profile.dto';

@Injectable()
export class SpacesService extends BaseService<UpdateSpaceDto> {
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: SPACE_CACHE_SIZE,
      className: 'SPACE_TB',
      field: 'uuid',
    });
  }

  generateKey(data: UpdateSpaceDto): string {
    return data.uuid;
  }

  async processData(spaceUuid: string, profileData: UpdateProfileDto) {
    const spaceResponseData = await super.findOne(spaceUuid);
    const spaceData = spaceResponseData.data;
    const data = { profileData, spaceData };
    return data;
  }
}
