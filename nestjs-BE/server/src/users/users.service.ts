import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import generateUuid from '../utils/uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUserByEmailAndProvider(
    email: string,
    provider: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email_provider: { email, provider } },
    });
  }

  async getOrCreateUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user.upsert({
      where: { email_provider: { email: data.email, provider: data.provider } },
      update: {},
      create: {
        uuid: generateUuid(),
        email: data.email,
        provider: data.provider,
      },
    });
  }
}
