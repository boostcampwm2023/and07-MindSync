import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, UploadService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
