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

  async findProfileSpacesByProfileUuid(
    profileUuid: string,
  ): Promise<ProfileSpace[]> {
    return this.prisma.profileSpace.findMany({
      where: { profileUuid: profileUuid },
    });
  }

  async findProfileSpacesBySpaceUuid(
    spaceUuid: string,
  ): Promise<ProfileSpace[]> {
    return this.prisma.profileSpace.findMany({
      where: { spaceUuid: spaceUuid },
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

  async leaveSpace(
    profileUuid: string,
    spaceUuid: string,
  ): Promise<ProfileSpace | null> {
    try {
      return await this.prisma.profileSpace.delete({
        where: {
          spaceUuid_profileUuid: {
            spaceUuid: spaceUuid,
            profileUuid: profileUuid,
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
    const first = await this.prisma.profileSpace.findFirst({
      where: {
        spaceUuid: spaceUuid,
      },
    });
    return first ? false : true;
  }
}
