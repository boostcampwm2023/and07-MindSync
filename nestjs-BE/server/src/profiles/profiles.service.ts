import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { PROFILE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService extends BaseService<UpdateProfileDto> {
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
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
