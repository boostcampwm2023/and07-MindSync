import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProfileSpace } from '@prisma/client';

@Injectable()
export class ProfileSpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfileSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<ProfileSpace | null> {
    return this.prisma.profileSpace.create({
      data: { spaceUuid, profileUuid },
    });
  }

  async deleteProfileSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<ProfileSpace | null> {
    return this.prisma.profileSpace.delete({
      where: { spaceUuid_profileUuid: { spaceUuid, profileUuid } },
    });
  }

  async findProfileSpaceByBothUuid(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<ProfileSpace | null> {
    return this.prisma.profileSpace.findUnique({
      where: { spaceUuid_profileUuid: { spaceUuid, profileUuid } },
    });
  }

  async joinSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<ProfileSpace | null> {
    try {
      return await this.prisma.profileSpace.create({
        data: { spaceUuid: spaceUuid, profileUuid: profileUuid },
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
    const first = await this.prisma.profileSpace.findFirst({
      where: {
        spaceUuid: spaceUuid,
      },
    });
    return first ? false : true;
  }

  async isProfileInSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<boolean> {
    const profileSpace = await this.prisma.profileSpace.findUnique({
      where: { spaceUuid_profileUuid: { spaceUuid, profileUuid } },
    });
    return profileSpace ? true : false;
  }
}
