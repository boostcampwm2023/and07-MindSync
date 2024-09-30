import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController, SpacesControllerV2 } from './spaces.controller';
import { UploadService } from '../upload/upload.service';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [forwardRef(() => ProfileSpaceModule), ProfilesModule],
  controllers: [SpacesController, SpacesControllerV2],
  providers: [SpacesService, UploadService],
  exports: [SpacesService],
})
export class SpacesModule {}
