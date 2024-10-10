import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Profile, Space } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { UpdateSpacePrismaDto } from './dto/update-space.dto';
import { CreateSpacePrismaDto } from './dto/create-space.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  async findSpaceBySpaceUuid(spaceUuid: string): Promise<Space | null> {
    return this.prisma.space.findUnique({ where: { uuid: spaceUuid } });
  }

  async findSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Space> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    const space = await this.findSpaceBySpaceUuid(spaceUuid);
    if (!space) throw new NotFoundException();
    const isProfileInSpace = await this.profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );
    if (!isProfileInSpace) throw new ForbiddenException();
    return space;
  }

  async createSpace(
    userUuid: string,
    profileUuid: string,
    icon: Express.Multer.File,
    createSpaceDto: CreateSpacePrismaDto,
  ): Promise<Space> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    const iconUrl = icon
      ? await this.uploadService.uploadFile(icon)
      : this.configService.get<string>('APP_ICON_URL');
    const space = await this.prisma.space.create({
      data: {
        uuid: uuid(),
        name: createSpaceDto.name,
        icon: iconUrl,
      },
    });
    await this.profileSpaceService.createProfileSpace(profileUuid, space.uuid);
    return space;
  }

  async updateSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
    icon: Express.Multer.File,
    updateSpaceDto: UpdateSpacePrismaDto,
  ): Promise<Space> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    const isProfileInSpace = await this.profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );
    if (!isProfileInSpace) throw new ForbiddenException();
    if (icon) {
      updateSpaceDto.icon = await this.uploadService.uploadFile(icon);
    }
    let space: Space;
    try {
      space = await this.prisma.space.update({
        where: { uuid: spaceUuid },
        data: updateSpaceDto,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException();
      } else {
        throw err;
      }
    }
    return space;
  }

  async deleteSpace(spaceUuid: string): Promise<Space> {
    return this.prisma.space.delete({ where: { uuid: spaceUuid } });
  }

  async joinSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Space> {
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
    return this.findSpaceBySpaceUuid(spaceUuid);
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
      if (isSpaceEmpty) await this.deleteSpace(spaceUuid);
    } catch (err) {}
  }

  async findProfilesInSpace(
    userUuid: string,
    profileUuid: string,
    spaceUuid: string,
  ): Promise<Profile[]> {
    await this.usersService.verifyUserProfile(userUuid, profileUuid);
    const isProfileInSpace = await this.profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );
    if (!isProfileInSpace) throw new ForbiddenException();
    return this.prisma.profile.findMany({
      where: { spaces: { some: { spaceUuid } } },
    });
  }
}
