import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MatchUserProfileGuard } from './guards/match-user-profile.guard';
import { IsProfileInSpaceGuard } from './guards/is-profile-in-space.guard';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule,
    ProfilesModule,
    RefreshTokensModule,
    ProfileSpaceModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    MatchUserProfileGuard,
    IsProfileInSpaceGuard,
  ],
  exports: [
    AuthService,
    MatchUserProfileGuard,
    ProfilesModule,
    IsProfileInSpaceGuard,
    ProfileSpaceModule,
  ],
})
export class AuthModule {}
