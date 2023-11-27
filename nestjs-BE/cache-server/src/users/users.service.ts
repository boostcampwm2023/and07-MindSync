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
      field: 'email',
    });
  }

  generateKey(data: UpdateUserDto): string {
    return data.email;
  }

  async getProfiles(email: string) {
    let user = await this.prisma[this.className].findUnique({
      where: { email },
      include: { profiles: true },
    });

    if (!user) user = await super.getDataFromCacheOrDB(email);
    if (!user) return null;

    const profiles = user.profiles || [];
    const temporaryProfilesUuids =
      this.temporaryDatabaseService.getUserProfiles(user.uuid);
    const temporaryProfiles = temporaryProfilesUuids.map((uuid) =>
      this.temporaryDatabaseService.get('PROFILE_TB', uuid, 'insert'),
    );
    const combinedProfiles = [...profiles, ...temporaryProfiles];
    const mergedData = combinedProfiles.map((data) => {
      const updateOperation = this.temporaryDatabaseService.get(
        'PROFILE_TB',
        data.uuid,
        'update',
      );
      if (updateOperation) return { ...data, ...updateOperation.value };
      return data;
    });
    return mergedData;
  }
}
