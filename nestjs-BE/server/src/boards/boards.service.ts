import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { Board } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<Board>,
    private uploadService: UploadService,
    private configService: ConfigService,
  ) {}

  async create(
    createBoardDto: CreateBoardDto,
    imageUrl: string | null,
  ): Promise<Board> {
    const { boardName, spaceId } = createBoardDto;
    const uuid = v4();
    const now = new Date();
    const board = this.boardModel.create({
      boardName,
      imageUrl,
      spaceId,
      uuid,
      createdAt: now,
      restoredAt: now,
    });
    return board;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    image: Express.Multer.File | undefined,
  ) {
    const imageUrl = image
      ? await this.uploadService.uploadFile(image)
      : this.configService.get<string>('APP_ICON_URL');
    return this.create(createBoardDto, imageUrl);
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
