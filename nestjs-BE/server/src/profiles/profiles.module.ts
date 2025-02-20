import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { UploadModule } from '../upload/upload.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchUserProfileGuard } from './guards/match-user-profile.guard';

@Module({
  imports: [UploadModule, PrismaModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, MatchUserProfileGuard],
  exports: [ProfilesService, MatchUserProfileGuard],
})
export class ProfilesModule {}
