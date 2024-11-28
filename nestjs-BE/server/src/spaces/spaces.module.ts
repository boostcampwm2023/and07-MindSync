import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UploadModule } from '../upload/upload.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [ProfileSpaceModule, UploadModule, ProfilesModule],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
