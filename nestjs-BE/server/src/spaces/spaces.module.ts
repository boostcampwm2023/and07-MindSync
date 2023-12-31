import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UploadService } from 'src/upload/upload.service';
import { ProfileSpaceModule } from 'src/profile-space/profile-space.module';

@Module({
  imports: [forwardRef(() => ProfileSpaceModule)],
  controllers: [SpacesController],
  providers: [SpacesService, UploadService],
  exports: [SpacesService],
})
export class SpacesModule {}
