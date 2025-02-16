import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardTreesService } from './board-trees.service';
import { BoardTreesGateway } from './board-trees.gateway';
import { BoardTree, BoardTreeSchema } from './schemas/board-tree.schema';
import {
  BoardOperation,
  BoardOperationSchema,
} from './schemas/board-operation.schema';
import { WsMatchUserProfileGuard } from './guards/ws-match-user-profile.guard';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoardTree.name, schema: BoardTreeSchema },
      { name: BoardOperation.name, schema: BoardOperationSchema },
    ]),
    JwtModule,
    ProfilesModule,
  ],
  providers: [BoardTreesService, BoardTreesGateway, WsMatchUserProfileGuard],
})
export class BoardTreesModule {}
