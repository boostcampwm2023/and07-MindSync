import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Profile, Space } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { UploadService } from '../upload/upload.service';
import { omit } from '../utils/omit';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly uploadService: UploadService,
  ) {}

  async findSpaceBySpaceUuid(spaceUuid: string): Promise<Space | null> {
    return this.prisma.space.findUnique({ where: { uuid: spaceUuid } });
  }

  async findSpace(spaceUuid: string): Promise<Space> {
    const space = await this.findSpaceBySpaceUuid(spaceUuid);
    if (!space) throw new NotFoundException();
    return space;
  }

  async createSpace(
    icon: Express.Multer.File,
    createSpaceDto: CreateSpaceDto,
  ): Promise<Space> {
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
    await this.profileSpaceService.createProfileSpace(
      createSpaceDto.profileUuid,
      space.uuid,
    );
    return space;
  }

  async updateSpace(
    spaceUuid: string,
    icon: Express.Multer.File,
    updateSpaceDto: UpdateSpaceDto,
  ): Promise<Space> {
    const updateData: Partial<UpdateSpaceDto> = omit(updateSpaceDto, [
      'icon',
      'profileUuid',
    ]);
    if (icon) {
      updateData.icon = await this.uploadService.uploadFile(icon);
    }
    let space: Space;
    try {
      space = await this.prisma.space.update({
        where: { uuid: spaceUuid },
        data: updateData,
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

  async joinSpace(profileUuid: string, spaceUuid: string): Promise<Space> {
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

  async leaveSpace(profileUuid: string, spaceUuid: string): Promise<void> {
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

  async findProfilesInSpace(spaceUuid: string): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      where: { spaces: { some: { spaceUuid } } },
    });
  }
}
