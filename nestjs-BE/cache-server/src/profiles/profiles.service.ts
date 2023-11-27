import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { PROFILE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { SpacesService } from '../spaces/spaces.service';
import { ProfileSpaceDto } from './dto/profile-space.dto';

@Injectable()
export class ProfilesService extends BaseService<UpdateProfileDto> {
  joinTable = 'PROFILE_SPACE_TB';
  constructor(
    protected prisma: PrismaService,
    protected temporaryDatabaseService: TemporaryDatabaseService,
    protected spacesService: SpacesService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: PROFILE_CACHE_SIZE,
      className: 'PROFILE_TB',
      field: 'uuid',
    });
  }

  generateKey(data: UpdateProfileDto): string {
    return data.uuid;
  }

  async create(data: CreateProfileDto): Promise<UpdateProfileDto | string> {
    const createdProfile = await super.create(data);
    if (typeof createdProfile !== 'string') {
      this.temporaryDatabaseService.addEntry(data.user_id, createdProfile.uuid);
    }
    return createdProfile;
  }

  async remove(key: string) {
    const profile = await super.getDataFromCacheOrDB(key);
    if (profile) {
      this.temporaryDatabaseService.removeEntry(profile.user_id, key);
    }
    await super.remove(key);
  }

  async joinSpace(data: ProfileSpaceDto) {
    const { profile_uuid: profileUuid, space_uuid: spaceUuid } = data;
    const result = await this.getProfileAndSpace(profileUuid, spaceUuid);
    if (typeof result === 'string') return result;

    this.temporaryDatabaseService.create(this.joinTable, profileUuid, data);
    this.temporaryDatabaseService.addEntry(profileUuid, spaceUuid);
    this.temporaryDatabaseService.addEntry(spaceUuid, profileUuid);
  }

  async leaveSpace(profileUuid: string, spaceUuid: string) {
    const result = await this.getProfileAndSpace(profileUuid, spaceUuid);
    if (typeof result === 'string') return result;

    const insertTemporaryData = this.temporaryDatabaseService.get(
      this.joinTable,
      profileUuid,
      'insert',
    );
    if (insertTemporaryData) {
      this.temporaryDatabaseService.delete(
        this.joinTable,
        profileUuid,
        'insert',
      );
      this.temporaryDatabaseService.removeEntry(profileUuid, spaceUuid);
      this.temporaryDatabaseService.removeEntry(spaceUuid, profileUuid);
    } else {
      const data = {
        field: 'space_uuid_profile_uuid',
        value: {
          space_uuid: spaceUuid,
          profile_uuid: profileUuid,
        },
      };
      this.temporaryDatabaseService.remove(this.joinTable, profileUuid, data);
    }
  }

  private async getProfileAndSpace(profileUuid: string, spaceUuid: string) {
    const profile = await super.getDataFromCacheOrDB(profileUuid);
    if (!profile) return `Profile not found: ${profileUuid}`;
    const space = await this.spacesService.getDataFromCacheOrDB(spaceUuid);
    if (!space) return `Space not found: ${spaceUuid}`;
    return { profile, space };
  }
}
