import { Injectable } from '@nestjs/common';
import { PrismaServiceMySQL } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { SPACE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService extends BaseService<UpdateSpaceDto> {
  constructor(
    protected prisma: PrismaServiceMySQL,
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
}
