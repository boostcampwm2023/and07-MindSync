import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Prisma, Space } from '@prisma/client';
import { CreateSpacePrismaDto } from './dto/create-space.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SpacesService {
  constructor(protected prisma: PrismaService) {}

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
    updateSpaceDto: UpdateSpaceDto,
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
}
