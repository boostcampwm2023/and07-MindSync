import { Module } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { InviteCodesController } from './invite-codes.controller';
import { SpacesService } from 'src/spaces/spaces.service';

@Module({
  controllers: [InviteCodesController],
  providers: [InviteCodesService, SpacesService],
})
export class InviteCodesModule {}
