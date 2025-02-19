import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile, Prisma } from '@prisma/client';
import { isUndefined, omitBy } from 'lodash';
import { v4 as uuid } from 'uuid';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

type UpdateData = {
  nickname?: string;
  image?: string;
};

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async findProfileByUserUuid(userUuid: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userUuid },
    });
    if (!profile) throw new NotFoundException();
    return profile;
  }

  async findProfileByProfileUuid(uuid: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { uuid } });
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
    profileUuid: string,
    image: Express.Multer.File,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile | null> {
    const updateData: UpdateData = { nickname: updateProfileDto.nickname };
    if (image) {
      updateData.image = await this.uploadService.uploadFile(image);
    }
    try {
      return await this.prisma.profile.update({
        where: { uuid: profileUuid },
        data: omitBy(updateData, isUndefined),
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }
}
