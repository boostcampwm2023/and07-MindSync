import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { USER_CACHE_SIZE } from '../config/magic-number';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService extends BaseService<UpdateUserDto> {
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: USER_CACHE_SIZE,
      className: 'USER_TB',
      field: 'email_provider',
    });
  }

  generateKey(data: UpdateUserDto) {
    return `email:${data.email}+provider:${data.provider}`;
  }
}
