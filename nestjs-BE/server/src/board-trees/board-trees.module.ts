import { Module } from '@nestjs/common';
import { BoardTreesService } from './board-trees.service';
import { BoardTreesGateway } from './board-trees.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardTree, BoardTreeSchema } from './schemas/board-tree.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoardTree.name, schema: BoardTreeSchema },
    ]),
  ],
  providers: [BoardTreesService, BoardTreesGateway],
})
export class BoardTreesModule {}
