import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import generateUuid from '../utils/uuid';
import { Prisma, RefreshToken } from '@prisma/client';
import { REFRESH_TOKEN_EXPIRY_DAYS } from '../config/magic-number';
import { ConfigService } from '@nestjs/config';

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
        expiry_date: this.getExpiryDate(),
        user_id: userUuid,
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

  createToken(): string {
    const refreshToken = this.jwtService.sign(
      { uuid: generateUuid() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '14d',
      },
    );
    return refreshToken;
  }

  getExpiryDate(): Date {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    return expiryDate;
  }
}
