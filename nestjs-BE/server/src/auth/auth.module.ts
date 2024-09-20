import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfilesModule } from '../profiles/profiles.module';
import { RefreshTokensService } from './refresh-tokens.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule, ProfilesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    RefreshTokensService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
