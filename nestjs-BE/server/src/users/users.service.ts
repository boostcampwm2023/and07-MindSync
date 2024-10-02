import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserPrismaDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateUser(data: CreateUserPrismaDto): Promise<User> {
    return this.prisma.$transaction(async () => {
      const kakaoUser = await this.prisma.kakaoUser.findUnique({
        where: { email: data.email },
      });

      if (!kakaoUser) {
        const newUser = await this.prisma.user.create({
          data: {
            uuid: uuid(),
          },
        });
        await this.prisma.kakaoUser.create({
          data: {
            email: data.email,
            userUuid: newUser.uuid,
          },
        });
        return newUser;
      }

      const user = await this.prisma.user.findUnique({
        where: { uuid: kakaoUser.userUuid },
      });
      return user;
    });
  }
}
