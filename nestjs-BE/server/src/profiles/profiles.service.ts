import { Injectable } from '@nestjs/common';
import { PrismaServiceMySQL } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { PROFILE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class ProfilesService extends BaseService<UpdateProfileDto> {
  profileSpaceTable = 'PROFILE_SPACE_TB';
  constructor(
    protected prisma: PrismaServiceMySQL,
    protected temporaryDatabaseService: TemporaryDatabaseService,
    protected spacesService: SpacesService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: PROFILE_CACHE_SIZE,
      className: 'PROFILE_TB',
      field: 'user_id',
    });
  }

  generateKey(data: UpdateProfileDto): string {
    return data.user_id;
  }
}
