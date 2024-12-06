import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardTreesService } from './board-trees.service';
import { BoardTreesGateway } from './board-trees.gateway';
import { BoardTree, BoardTreeSchema } from './schemas/board-tree.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoardTree.name, schema: BoardTreeSchema },
    ]),
    JwtModule,
  ],
  providers: [BoardTreesService, BoardTreesGateway],
})
export class BoardTreesModule {}
