import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { Board } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UploadService } from '../upload/upload.service';

const BOARD_EXPIRE_DAY = 7;

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
    const boardList = await this.boardModel.find({ spaceId }).exec();
    const filteredList = boardList.reduce<Array<any>>((list, board) => {
      let isDeleted = false;

      if (board.deletedAt && board.deletedAt > board.restoredAt) {
        const expireDate = new Date(board.deletedAt);
        expireDate.setDate(board.deletedAt.getDate() + BOARD_EXPIRE_DAY);
        if (new Date() > expireDate) {
          this.deleteExpiredBoard(board.uuid);
          return list;
        }
        isDeleted = true;
      }

      list.push({
        boardId: board.uuid,
        boardName: board.boardName,
        createdAt: board.createdAt,
        imageUrl: board.imageUrl,
        isDeleted,
      });
      return list;
    }, []);
    return filteredList;
  }

  async deleteBoard(boardId: string) {
    const now = new Date();
    const board = await this.boardModel.updateOne(
      { uuid: boardId },
      { deletedAt: now },
    );
    if (!board.matchedCount) {
      throw new NotFoundException('Target board not found.');
    }
    return board;
  }

  async deleteExpiredBoard(boardId: string) {
    return this.boardModel.deleteOne({ uuid: boardId });
  }

  async restoreBoard(boardId: string) {
    const now = new Date();
    const board = await this.boardModel.updateOne(
      { uuid: boardId },
      { restoredAt: now },
    );
    if (!board.matchedCount) {
      throw new NotFoundException('Target board not found.');
    }
    return board;
  }
}
