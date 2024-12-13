import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { SpacesModule } from '../spaces/spaces.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [SpacesModule, ProfileSpaceModule, ProfilesModule],
  controllers: [InviteCodesController],
  providers: [InviteCodesService],
})
export class InviteCodesModule {}
