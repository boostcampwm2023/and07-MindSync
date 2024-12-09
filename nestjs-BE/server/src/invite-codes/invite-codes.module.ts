import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { SpacesModule } from '../spaces/spaces.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';

@Module({
  imports: [SpacesModule, ProfileSpaceModule],
  controllers: [InviteCodesController],
  providers: [InviteCodesService],
})
export class InviteCodesModule {}
