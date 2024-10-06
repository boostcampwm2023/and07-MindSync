import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UploadModule } from '../upload/upload.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => ProfileSpaceModule), UploadModule, UsersModule],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
