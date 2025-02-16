import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardOperation } from './schemas/board-operation.schema';

@Injectable()
export class BoardTreesService {
  constructor(
    @InjectModel(BoardOperation.name)
    private boardOperationModel: Model<BoardOperation>,
  ) {}

  async createOperationLog(operation: BoardOperation) {
    return this.boardOperationModel.create(operation);
  }

  async getOperationLogs(boardId: string) {
    return this.boardOperationModel
      .find({ boardId })
      .select('-_id -__v')
      .lean();
  }
}
