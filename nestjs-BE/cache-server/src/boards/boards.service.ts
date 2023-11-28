import { Injectable } from '@nestjs/common';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaServiceMongoDB } from 'src/prisma/prisma.service';
import { BOARD_CACHE_SIZE } from 'src/config/magic-number';
import { BaseService } from 'src/base/base.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
@Injectable()
export class BoardsService extends BaseService<UpdateBoardDto> {
  constructor(
    protected prisma: PrismaServiceMongoDB,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: BOARD_CACHE_SIZE,
      className: 'BoardCollection',
      field: 'uuid',
    });
  }

  generateKey(data: UpdateBoardDto): string {
    return data.uuid;
  }
}
