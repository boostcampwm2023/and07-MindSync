import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SpacesService } from 'src/spaces/spaces.service';

@Module({
  providers: [UsersService, SpacesService],
  exports: [UsersService],
})
export class UsersModule {}
