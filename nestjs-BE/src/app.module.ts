import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardGateway } from './board/board.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BoardGateway],
})
export class AppModule {}
