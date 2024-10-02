import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController, SpacesControllerV2 } from './spaces.controller';
import { UploadModule } from '../upload/upload.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [forwardRef(() => ProfileSpaceModule), ProfilesModule, UploadModule],
  controllers: [SpacesController, SpacesControllerV2],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
