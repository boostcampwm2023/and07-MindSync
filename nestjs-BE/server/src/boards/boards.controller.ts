import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { RestoreBoardDto } from './dto/restore-board.dto';

const BOARD_EXPIRE_DAY = 7;

@Controller('boards')
@ApiTags('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Public()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createBoard(@Body() createBoardDto: CreateBoardDto) {
    const document = await this.boardsService.create(createBoardDto);
    const responseData = { boardId: document.uuid, date: document.createdAt };
    return responseData;
  }

  @Public()
  @Get('list')
  async findBySpaceId(@Query('spaceId') spaceId: string) {
    const boardList = await this.boardsService.findBySpaceId(spaceId);
    const responseData = boardList.reduce((list, board) => {
      let isDeleted = false;

      if (board.deletedAt && board.deletedAt > board.restoredAt) {
        const expireDate = new Date(board.deletedAt);
        expireDate.setDate(board.deletedAt.getDate() + BOARD_EXPIRE_DAY);
        if (new Date() > expireDate) {
          this.boardsService.deleteExpiredBoard(board.uuid);
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
    return responseData;
  }

  @Public()
  @Patch('delete')
  async deleteBoard(@Body() deleteBoardDto: DeleteBoardDto) {
    const updateResult = await this.boardsService.deleteBoard(
      deleteBoardDto.boardId,
    );
    if (!updateResult.matchedCount) throw new NotFoundException();
    return 'board deleted.';
  }

  @Public()
  @Patch('restore')
  async restoreBoard(@Body() resotreBoardDto: RestoreBoardDto) {
    const updateResult = await this.boardsService.restoreBoard(
      resotreBoardDto.boardId,
    );
    if (!updateResult.matchedCount) throw new NotFoundException();
    return 'board restored.';
  }
}
