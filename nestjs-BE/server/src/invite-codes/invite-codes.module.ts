import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { SpacesModule } from '../spaces/spaces.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, SpacesModule],
  controllers: [InviteCodesController],
  providers: [InviteCodesService],
})
export class InviteCodesModule {}
