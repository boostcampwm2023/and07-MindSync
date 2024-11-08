import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board, BoardSchema } from './schemas/board.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    UploadModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
