import { Module, forwardRef } from '@nestjs/common';
import { ProfileSpaceService } from './profile-space.service';
import { ProfileSpaceController } from './profile-space.controller';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { SpacesModule } from 'src/spaces/spaces.module';

@Module({
  imports: [ProfilesModule, forwardRef(() => SpacesModule)],
  controllers: [ProfileSpaceController],
  providers: [ProfileSpaceService],
  exports: [ProfileSpaceService],
})
export class ProfileSpaceModule {}
