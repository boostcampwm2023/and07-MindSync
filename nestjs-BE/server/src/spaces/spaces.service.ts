import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSpacePrismaDto } from './dto/update-space.dto';
import { Prisma, Profile, Space } from '@prisma/client';
import { CreateSpacePrismaDto } from './dto/create-space.dto';
import { v4 as uuid } from 'uuid';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly usersService: UsersService,
  ) {}

  async findSpace(spaceUuid: string): Promise<Space | null> {
    return this.prisma.space.findUnique({ where: { uuid: spaceUuid } });
  }

  async findSpaces(spaceUuids: string[]): Promise<Space[]> {
    return this.prisma.space.findMany({ where: { uuid: { in: spaceUuids } } });
  }

  async createSpace(createSpaceDto: CreateSpacePrismaDto): Promise<Space> {
    return this.prisma.space.create({
      data: {
        uuid: uuid(),
        name: createSpaceDto.name,
        icon: createSpaceDto.icon,
      },
    });
  }

  async updateSpace(
    spaceUuid: string,
    updateSpaceDto: UpdateSpacePrismaDto,
  ): Promise<Space | null> {
    try {
      return await this.prisma.space.update({
        where: { uuid: spaceUuid },
        data: { ...updateSpaceDto },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  async deleteSpace(spaceUuid: string): Promise<Space> {
    return this.prisma.space.delete({ where: { uuid: spaceUuid } });
  }

  async joinSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<void> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    try {
      await this.profileSpaceService.createProfileSpace(profileUuid, spaceUuid);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
          case 'P2002':
            throw new ConflictException();
          case 'P2003':
            throw new ForbiddenException();
          default:
            throw err;
        }
      } else {
        throw err;
      }
    }
  }

  async leaveSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<void> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    try {
      await this.profileSpaceService.deleteProfileSpace(profileUuid, spaceUuid);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
          case 'P2025':
            throw new NotFoundException();
          default:
            throw err;
        }
      } else {
        throw err;
      }
    }
    const isSpaceEmpty = await this.profileSpaceService.isSpaceEmpty(spaceUuid);
    try {
      if (!isSpaceEmpty) await this.deleteSpace(spaceUuid);
    } catch (err) {}
  }

  async findProfilesInSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Profile[]> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    return this.prisma.profile.findMany({
      where: { spaces: { some: { spaceUuid } } },
    });
  }
}
