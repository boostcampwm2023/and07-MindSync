import { Injectable } from '@nestjs/common';
import { PrismaServiceMySQL } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { PROFILE_CACHE_SIZE } from 'src/config/magic-number';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { SpacesService } from '../spaces/spaces.service';
import { ProfileSpaceDto } from './dto/profile-space.dto';

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
    const key = `${profileUuid}_${spaceUuid}`;
    const isExists = await this.isDataExists(key, spaceUuid, profileUuid);
    if (typeof isExists === 'string') return isExists;

    this.temporaryDatabaseService.create(this.profileSpaceTable, key, data);
    this.temporaryDatabaseService.addEntry(profileUuid, spaceUuid);
    this.temporaryDatabaseService.addEntry(spaceUuid, profileUuid);
  }

  async leaveSpace(profileUuid: string, spaceUuid: string) {
    const result = await this.getProfileAndSpace(profileUuid, spaceUuid);
    if (typeof result === 'string') return result;
    const key = `${profileUuid}_${spaceUuid}`;
    const insertTemporaryData = this.temporaryDatabaseService.get(
      this.profileSpaceTable,
      key,
      'insert',
    );
    if (insertTemporaryData) {
      this.temporaryDatabaseService.delete(
        this.profileSpaceTable,
        key,
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
      this.temporaryDatabaseService.remove(this.profileSpaceTable, key, data);
    }
  }

  private async getProfileAndSpace(profileUuid: string, spaceUuid: string) {
    const profile = await super.getDataFromCacheOrDB(profileUuid);
    if (!profile) return `Profile not found: ${profileUuid}`;
    const space = await this.spacesService.getDataFromCacheOrDB(spaceUuid);
    if (!space) return `Space not found: ${spaceUuid}`;
    return { profile, space };
  }

  async isDataExists(key: string, space_uuid: string, profile_uuid: string) {
    const existingEntry = await this.prisma[this.profileSpaceTable].findUnique({
      where: {
        space_uuid_profile_uuid: {
          space_uuid,
          profile_uuid,
        },
      },
    });

    const existingTempEntry = this.temporaryDatabaseService.get(
      this.profileSpaceTable,
      key,
      'insert',
    );

    const deleteTemporaryData = this.temporaryDatabaseService.get(
      this.profileSpaceTable,
      key,
      'delete',
    );
    if (deleteTemporaryData) {
      this.temporaryDatabaseService.delete(
        this.profileSpaceTable,
        key,
        'delete',
      );
      return 'Removed the data scheduled for deletion and re-joined the room.';
    }
    if (existingEntry || existingTempEntry) {
      return 'Data already exists.';
    }
    return;
  }

  async findUsers(uuid: string) {
    const space = await this.prisma['SPACE_TB'].findUnique({
      where: {
        uuid,
      },
      include: {
        profiles: { include: { profile: true } },
      },
    });

    space.profiles = space.profiles.filter((profileSpace) => {
      const deleteTempData = this.temporaryDatabaseService.get(
        'PROFILE_SPACE_TB',
        `${profileSpace.profile_uuid}_${profileSpace.space_uuid}`,
        'delete',
      );
      return !deleteTempData;
    });

    const spaceUuidsFromTempDB = this.temporaryDatabaseService.getEntries(uuid);
    const addedProfiles = await Promise.all(
      spaceUuidsFromTempDB.map(async (spaceUuid) => {
        const insertTempData = this.temporaryDatabaseService.get(
          'PROFILE_SPACE_TB',
          `${spaceUuid}_${uuid}`,
          'insert',
        );
        if (insertTempData) {
          const userProfile = await super.getDataFromCacheOrDB(spaceUuid);
          if (userProfile) {
            return {
              profile_uuid: spaceUuid,
              profile: userProfile,
            };
          }
        }
        return null;
      }),
    );
    space.profiles = [
      ...space.profiles,
      ...addedProfiles.filter((profile) => profile),
    ];
    return space.profiles.map((profileSpace) => profileSpace.profile);
  }
}
