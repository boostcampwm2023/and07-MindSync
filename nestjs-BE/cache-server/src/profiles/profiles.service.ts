import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { PROFILE_CACHE_SIZE } from 'src/config/magic-number';

export interface Profile {
  uuid?: string;
  user_id: string;
  image: string;
  nickname: string;
}

@Injectable()
export class ProfilesService extends BaseService<Profile> {
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: PROFILE_CACHE_SIZE,
      className: 'PROFILE_TB',
      field: 'uuid',
    });
  }

  generateKey(data: any): string {
    return data.uuid;
  }

  async create(data: Profile): Promise<Profile | string> {
    const createdProfile = await super.create(data);
    if (typeof createdProfile !== 'string') {
      this.temporaryDatabaseService.addUserProfile(
        data.user_id,
        createdProfile.uuid,
      );
    }
    return createdProfile;
  }

  async remove(key: string) {
    const profile = await super.getDataFromCacheOrDB(key);
    if (profile) {
      this.temporaryDatabaseService.removeUserProfile(profile.user_id, key);
    }
    await super.remove(key);
  }
}
