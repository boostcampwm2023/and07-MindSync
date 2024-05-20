import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import generateUuid from '../utils/uuid';

@Injectable()
export class UsersService {
  constructor(protected prisma: PrismaService) {}

  async findUserByEmailAndProvider(
    email: string,
    provider: string,
  ): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email_provider: { email, provider } },
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        uuid: generateUuid(),
        email: data.email,
        provider: data.provider,
      },
    });
  }
}
