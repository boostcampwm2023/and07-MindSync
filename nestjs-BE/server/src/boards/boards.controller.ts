import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@Controller('boards')
@ApiTags('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBoard(@Body() createBoardDto: CreateBoardDto) {
    const document = await this.boardsService.create(createBoardDto);
    const responseData = { boardId: document.uuid, date: document.date };
    return responseData;
  }

  @Public()
  @Get()
  async findBySpaceId(@Query('spaceId') spaceId: string) {
    const boardList = await this.boardsService.findBySpaceId(spaceId);
    const responseData = boardList.map((board) => {
      return {
        boardId: board.uuid,
        boardName: board.boardName,
        date: board.date,
        imageUrl: board.imageUrl,
      };
    });
    return responseData;
  }
}
