import { Module } from '@nestjs/common';
import { BoardTreesService } from './board-trees.service';
import { BoardTreesGateway } from './board-trees.gateway';

@Module({
  providers: [BoardTreesService, BoardTreesGateway],
})
export class BoardTreesModule {}
