import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SpacesService } from 'src/spaces/spaces.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SpacesService],
  exports: [UsersService],
})
export class UsersModule {}
