import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
}
