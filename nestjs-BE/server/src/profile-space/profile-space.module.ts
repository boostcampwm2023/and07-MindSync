import { Module } from '@nestjs/common';
import { ProfileSpaceService } from './profile-space.service';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [ProfilesModule],
  providers: [ProfileSpaceService],
  exports: [ProfileSpaceService],
})
export class ProfileSpaceModule {}
