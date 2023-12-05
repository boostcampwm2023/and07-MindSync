import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [SpacesController],
  providers: [SpacesService, UploadService],
})
export class SpacesModule {}
