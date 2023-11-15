import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardGateway } from './board/board.gateway';
import { MindmapService } from './mindmap/mindmap.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BoardGateway, MindmapService],
})
export class AppModule {}
