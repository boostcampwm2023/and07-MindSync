import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board } from './schemas/board.schema';
import { Model } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';
import { v4 } from 'uuid';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private boardModel: Model<Board>) {}

  async create(
    createBoardDto: CreateBoardDto,
    imageUrl: string | null,
  ): Promise<Board> {
    const { boardName, spaceId } = createBoardDto;
    const uuid = v4();
    const now = new Date();
    const createdBoard = new this.boardModel({
      boardName,
      imageUrl,
      spaceId,
      uuid,
      createdAt: now,
      restoredAt: now,
    });
    return createdBoard.save();
  }

  async findBySpaceId(spaceId: string): Promise<Board[]> {
    return this.boardModel.find({ spaceId }).exec();
  }

  async deleteBoard(boardId: string) {
    const now = new Date();
    return this.boardModel.updateOne({ uuid: boardId }, { deletedAt: now });
  }

  async deleteExpiredBoard(boardId: string) {
    return this.boardModel.deleteOne({ uuid: boardId });
  }

  async restoreBoard(boardId: string) {
    const now = new Date();
    return this.boardModel.updateOne({ uuid: boardId }, { restoredAt: now });
  }
}
