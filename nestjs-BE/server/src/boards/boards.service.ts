import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board } from './schemas/board.schema';
import { Model } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';
import { v4 } from 'uuid';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private boardModel: Model<Board>) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const { boardName, spaceId, imageUrl } = createBoardDto;
    const uuid = v4();
    const date = new Date();
    const createdBoard = new this.boardModel({
      boardName,
      imageUrl,
      spaceId,
      uuid,
      date,
    });
    return createdBoard.save();
  }
}
