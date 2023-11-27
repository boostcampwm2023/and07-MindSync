import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { SPACE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateSpaceDto } from './dto/update-space.dto';

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

  async joinSpace(profileUuid: string, spaceUuid: string) {
    const profileSpace = {
      space_uuid: spaceUuid,
      profile_uuid: profileUuid,
    };

    await this.prisma['PROFILE_SPACE_TB'].create({
      data: profileSpace,
    });

    return profileSpace;
  }

  async leaveSpace(profileUuid: string, spaceUuid: string) {
    await this.prisma['PROFILE_SPACE_TB'].delete({
      where: { space_uuid: spaceUuid, profile_uuid: profileUuid },
    });
  }
}
