import { Injectable } from '@nestjs/common';
import { ProfileSpace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
