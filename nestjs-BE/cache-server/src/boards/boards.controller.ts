import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.boardsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(uuid, updateBoardDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.boardsService.remove(uuid);
  }
}
