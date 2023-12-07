import { Injectable } from '@nestjs/common';
import { UpdateProfileSpaceDto } from './dto/update-profile-space.dto';
import { BaseService } from 'src/base/base.service';
import { PrismaServiceMySQL } from 'src/prisma/prisma.service';
import { TemporaryDatabaseService } from 'src/temporary-database/temporary-database.service';
import {
  PROFILE_SPACE_CACHE_SIZE,
  SPACE_USER_CACHE_SIZE,
  USER_SPACE_CACHE_SIZE,
} from 'src/config/magic-number';
import { CreateProfileSpaceDto } from './dto/create-profile-space.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UpdateProfileDto } from 'src/profiles/dto/update-profile.dto';
import { UpdateSpaceDto } from 'src/spaces/dto/update-space.dto';
import LRUCache from 'src/utils/lru-cache';

interface UpdateProfileAndSpaceDto {
  profileData: UpdateProfileDto;
  spaceData: UpdateSpaceDto;
}

@Injectable()
export class ProfileSpaceService extends BaseService<UpdateProfileSpaceDto> {
  private readonly userCache: LRUCache;
  private readonly spaceCache: LRUCache;
  constructor(
    protected prisma: PrismaServiceMySQL,
    protected temporaryDatabaseService: TemporaryDatabaseService,
    private readonly profilesService: ProfilesService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: PROFILE_SPACE_CACHE_SIZE,
      className: 'PROFILE_SPACE_TB',
      field: 'space_uuid_profile_uuid',
    });
    this.userCache = new LRUCache(USER_SPACE_CACHE_SIZE);
    this.spaceCache = new LRUCache(SPACE_USER_CACHE_SIZE);
  }

  generateKey(data: CreateProfileSpaceDto) {
    return `space_uuid:${data.space_uuid}+profile_uuid:${data.profile_uuid}`;
  }

  async create(data: CreateProfileSpaceDto) {
    const response = await super.create(data, false);
    return response;
  }

  async processData(userUuid: string, spaceUuid: string) {
    const profileResponse = await this.profilesService.findOne(userUuid);
    const profileUuid = profileResponse.data?.uuid;
    const joinData = {
      profile_uuid: profileUuid,
      space_uuid: spaceUuid,
    };
    return { joinData, profileData: profileResponse.data };
  }

  async put(
    userUuid: string,
    spaceUuid: string,
    data: UpdateProfileAndSpaceDto,
  ) {
    const { spaceData, profileData } = data;
    const userSpaces = await this.getUserSpaces(userUuid, profileData.uuid);
    userSpaces.push(spaceData);
    this.userCache.put(userUuid, userSpaces);
    const spaceProfiles = await this.getSpaceUsers(spaceUuid);
    spaceProfiles.push(profileData);
    this.spaceCache.put(spaceUuid, spaceProfiles);
  }

  async delete(
    userUuid: string,
    spaceUuid: string,
    profileData: UpdateProfileDto,
  ) {
    const userSpaces = await this.getUserSpaces(userUuid, profileData.uuid);
    const filterUserSpaces = userSpaces.filter(
      (space) => space.uuid !== spaceUuid,
    );
    this.userCache.put(userUuid, filterUserSpaces);
    const spaceUsers = await this.getSpaceUsers(spaceUuid);
    const filterSpaceUsers = spaceUsers.filter(
      (profile) => profile.uuid !== profileData.uuid,
    );
    this.userCache.put(spaceUuid, filterSpaceUsers);
    return filterSpaceUsers.length === 0;
  }

  async getUserSpaces(
    userUuid: string,
    profileUuid: string,
  ): Promise<UpdateProfileDto[]> {
    const cacheUserSpaces = this.userCache.get(userUuid);
    if (cacheUserSpaces) return cacheUserSpaces;
    const profileResponse = await this.prisma['PROFILE_TB'].findUnique({
      where: { uuid: profileUuid },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
    });
    const storeUserSpaces =
      profileResponse?.spaces.map((profileSpace) => profileSpace.space) || [];
    return storeUserSpaces;
  }

  async getSpaceUsers(spaceUuid: string): Promise<UpdateSpaceDto[]> {
    const cacheSpaceProfiles = this.spaceCache.get(spaceUuid);
    if (cacheSpaceProfiles) return cacheSpaceProfiles;

    const spaceResponse = await this.prisma['SPACE_TB'].findUnique({
      where: { uuid: spaceUuid },
      include: {
        profiles: {
          include: {
            profile: true,
          },
        },
      },
    });
    const storeSpaceProfiles =
      spaceResponse?.profiles.map((profileSpace) => profileSpace.profile) || [];
    return storeSpaceProfiles;
  }
}
