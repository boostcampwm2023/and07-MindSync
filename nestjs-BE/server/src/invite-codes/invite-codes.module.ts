import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { SpacesModule } from '../spaces/spaces.module';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [AuthModule, SpacesModule, ProfilesModule],
  controllers: [InviteCodesController],
  providers: [InviteCodesService],
})
export class InviteCodesModule {}
