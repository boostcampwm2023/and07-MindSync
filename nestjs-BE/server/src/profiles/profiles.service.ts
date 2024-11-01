import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async findProfileByUserUuid(userUuid: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userUuid } });
  }

  async findProfileByProfileUuid(uuid: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { uuid } });
  }

  async findProfiles(profileUuids: string[]): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      where: { uuid: { in: profileUuids } },
    });
  }

  async getOrCreateProfile(data: CreateProfileDto): Promise<Profile> {
    return this.prisma.profile.upsert({
      where: { userUuid: data.userUuid },
      update: {},
      create: {
        uuid: uuid(),
        userUuid: data.userUuid,
        image: data.image,
        nickname: data.nickname,
      },
    });
  }

  async updateProfile(
    userUuid: string,
    profileUuid: string,
    image: Express.Multer.File,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile | null> {
    await this.verifyUserProfile(userUuid, profileUuid);
    if (image) {
      updateProfileDto.image = await this.uploadService.uploadFile(image);
    }
    try {
      return await this.prisma.profile.update({
        where: { userUuid },
        data: updateProfileDto,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  async verifyUserProfile(
    userUuid: string,
    profileUuid: string,
  ): Promise<boolean> {
    const profile = await this.findProfileByProfileUuid(profileUuid);
    if (!profile) throw new NotFoundException();
    if (userUuid !== profile.userUuid) throw new ForbiddenException();
    return true;
  }
}
