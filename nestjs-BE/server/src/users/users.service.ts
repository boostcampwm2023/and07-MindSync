import { Injectable } from '@nestjs/common';
import { PrismaServiceMySQL } from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import { BaseService } from '../base/base.service';
import { USER_CACHE_SIZE } from '../config/magic-number';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileSpaceDto } from 'src/profiles/dto/profile-space.dto';
import { SpacesService } from 'src/spaces/spaces.service';
import { v4 } from 'uuid';

interface Profile {
  spaces: ProfileSpaceDto[];
}

type IncludeObject = {
  profiles:
    | boolean
    | {
        include?: {
          spaces:
            | boolean
            | {
                include?: {
                  space: boolean;
                };
              };
        };
      };
};

interface Item extends ProfileSpaceDto {
  uuid?: string;
}

export type User = {
  uuid: string;
  email: string;
};

@Injectable()
export class UsersService extends BaseService<UpdateUserDto> {
  profileTable = 'PROFILE_TB';
  profileSpaceTable = 'PROFILE_SPACE_TB';
  constructor(
    protected prisma: PrismaServiceMySQL,
    protected temporaryDatabaseService: TemporaryDatabaseService,
    protected spacesService: SpacesService,
  ) {
    super({
      prisma,
      temporaryDatabaseService,
      cacheSize: USER_CACHE_SIZE,
      className: 'USER_TB',
      field: 'email',
    });
  }

  private readonly users: User[] = [];

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  createOne(email: string) {
    this.users.push({ uuid: v4(), email });
  }

  generateKey(data: UpdateUserDto): string {
    return data.email;
  }

  async findProfiles(email: string, includeSpaces = false) {
    const user = await this.getUser(email, includeSpaces);
    if (!user) return;

    const profiles = user.profiles || [];
    const temporaryProfiles = this.getTemporaryProfiles(user);
    const combinedProfiles = [...profiles, ...temporaryProfiles];
    const mergedData = this.mergeProfileData(combinedProfiles);

    return mergedData;
  }

  async getUser(email: string, includeSpaces = false) {
    const includeObject: IncludeObject = { profiles: true };

    if (includeSpaces) {
      includeObject.profiles = {
        include: {
          spaces: {
            include: {
              space: true,
            },
          },
        },
      };
    }
    let user = await this.prisma[this.className].findUnique({
      where: { email },
      include: includeObject,
    });
    if (!user) user = await super.getDataFromCacheOrDB(email);
    if (user && user.profiles) {
      user.profiles = this.filterNotDeleted(this.profileTable, user.profiles);

      if (includeSpaces) {
        user.profiles.forEach((profile: Profile) => {
          if (profile.spaces) {
            profile.spaces = this.filterNotDeleted(
              this.profileSpaceTable,
              profile.spaces,
            );
          }
        });
      }
    }
    return user;
  }

  filterNotDeleted(tableName: string, items: Item[]) {
    return items.filter((item) => {
      let key = item.uuid;
      if (item.profile_uuid && item.space_uuid) {
        key = `${item.profile_uuid}_${item.space_uuid}`;
      }

      const deleteOperation = this.temporaryDatabaseService.get(
        tableName,
        key,
        'delete',
      );
      return !deleteOperation;
    });
  }

  getTemporaryProfiles(user: UpdateUserDto) {
    const temporaryProfilesUuids = this.temporaryDatabaseService.getEntries(
      user.uuid,
    );
    const temporaryProfiles = temporaryProfilesUuids.map((uuid) =>
      this.temporaryDatabaseService.get(this.profileTable, uuid, 'insert'),
    );
    return temporaryProfiles;
  }

  mergeProfileData(combinedProfiles: UpdateUserDto[]) {
    const mergedData = combinedProfiles.map((data) => {
      const updateOperation = this.temporaryDatabaseService.get(
        this.profileTable,
        data.uuid,
        'update',
      );
      if (updateOperation) return { ...data, ...updateOperation.value };
      return data;
    });
    return mergedData;
  }

  async findRooms(email: string) {
    const profiles = await this.findProfiles(email, true);
    if (!profiles) return;
    const spaceList = await profiles.reduce(async (listPromise, profile) => {
      const list = await listPromise;
      const spaceUuidsFromTempDB = this.temporaryDatabaseService.getEntries(
        profile.uuid,
      );
      profile.spaces = profile.spaces.filter((profileSpace) => {
        const deleteTempData = this.temporaryDatabaseService.get(
          this.profileSpaceTable,
          `${profileSpace.profile_uuid}_${profileSpace.space_uuid}`,
          'delete',
        );
        return !deleteTempData;
      });
      const updatedSpaces = await Promise.all(
        spaceUuidsFromTempDB.map(async (spaceUuid) => {
          const space =
            await this.spacesService.getDataFromCacheOrDB(spaceUuid);
          return { space_uuid: spaceUuid, profile_uuid: profile.uuid, space };
        }),
      );
      profile.spaces = [...profile.spaces, ...updatedSpaces];
      const spaces = profile.spaces
        .filter((profileSpace) => profileSpace.space)
        .map((profileSpace) => profileSpace.space);

      return list.concat(spaces);
    }, Promise.resolve([]));
    return spaceList;
  }
}
