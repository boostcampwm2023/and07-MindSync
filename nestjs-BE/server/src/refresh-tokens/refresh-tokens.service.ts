import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, RefreshToken } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { getExpiryDate } from '../utils/date';

@Injectable()
export class RefreshTokensService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createRefreshToken(userUuid: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        token: this.createToken(),
        expiryDate: getExpiryDate({ week: 2 }),
        userUuid,
      },
    });
  }

  async findRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
  }

  async deleteRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
    try {
      return await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      } else {
        throw err;
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredRefreshTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: { expiryDate: { lt: new Date() } },
    });
  }

  private createToken(): string {
    const refreshToken = this.jwtService.sign(
      { uuid: uuid() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '14d',
      },
    );
    return refreshToken;
  }
}
