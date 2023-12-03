import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { SpacesService } from '../spaces/spaces.service';
@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, SpacesService],
})
export class ProfilesModule {}
