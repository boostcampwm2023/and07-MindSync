import { Injectable } from '@nestjs/common';
import { Space, User } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateUser(data: CreateUserDto): Promise<User> {
    const kakaoUser = await this.prisma.kakaoUser.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        user: {
          create: {
            uuid: uuid(),
          },
        },
      },
    });
    return this.prisma.user.findUnique({ where: { uuid: kakaoUser.userUuid } });
  }

  async findUserJoinedSpaces(userUuid: string): Promise<Space[]> {
    const spaces = await this.prisma.space.findMany({
      where: { profileSpaces: { some: { profile: { userUuid } } } },
    });

    return spaces;
  }
}
