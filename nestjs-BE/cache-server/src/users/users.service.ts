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
    const user = await this.getUser(email);
    if (!user) return;

    const profiles = user.profiles || [];
    const temporaryProfiles = this.getTemporaryProfiles(user);
    const combinedProfiles = [...profiles, ...temporaryProfiles];
    const mergedData = this.mergeProfileData(combinedProfiles);

    return mergedData;
  }

  async getUser(email: string) {
    let user = await this.prisma[this.className].findUnique({
      where: { email },
      include: { profiles: true },
    });

    if (!user) user = await super.getDataFromCacheOrDB(email);
    return user;
  }

  getTemporaryProfiles(user: UpdateUserDto) {
    const temporaryProfilesUuids = this.temporaryDatabaseService.getEntries(
      user.uuid,
    );
    const temporaryProfiles = temporaryProfilesUuids.map((uuid) =>
      this.temporaryDatabaseService.get('PROFILE_TB', uuid, 'insert'),
    );
    return temporaryProfiles;
  }

  mergeProfileData(combinedProfiles: UpdateUserDto[]) {
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
