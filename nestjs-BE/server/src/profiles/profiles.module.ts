import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { SpacesService } from '../spaces/spaces.service';
import { UploadService } from 'src/upload/upload.service';
@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, SpacesService, UploadService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
