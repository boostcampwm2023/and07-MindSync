import { Module } from '@nestjs/common';
import { BoardTreesService } from './board-trees.service';

@Module({
  providers: [BoardTreesService],
})
export class BoardTreesModule {}
