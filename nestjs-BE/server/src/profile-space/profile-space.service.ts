import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Profile_space } from '@prisma/client';

@Injectable()
export class ProfileSpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileSpacesByProfileUuid(
    profileUuid: string,
  ): Promise<Profile_space[]> {
    return this.prisma.profile_space.findMany({
      where: { profile_uuid: profileUuid },
    });
  }

  async findProfileSpacesBySpaceUuid(
    spaceUuid: string,
  ): Promise<Profile_space[]> {
    return this.prisma.profile_space.findMany({
      where: { space_uuid: spaceUuid },
    });
  }

  async joinSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Profile_space | null> {
    try {
      return await this.prisma.profile_space.create({
        data: { space_uuid: spaceUuid, profile_uuid: profileUuid },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  async leaveSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Profile_space | null> {
    try {
      return await this.prisma.profile_space.delete({
        where: {
          space_uuid_profile_uuid: {
            space_uuid: spaceUuid,
            profile_uuid: profileUuid,
          },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  async isSpaceEmpty(spaceUuid: string) {
    const first = await this.prisma.profile_space.findFirst({
      where: {
        space_uuid: spaceUuid,
      },
    });
    return first ? false : true;
  }
}
