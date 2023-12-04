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
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@Controller('boards')
@ApiTags('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create board' })
  @ApiResponse({
    status: 201,
    description: 'The board has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Public()
  @Get(':board_uuid')
  @ApiOperation({ summary: 'Get board by board_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the board data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Board not found.',
  })
  findOne(@Param('board_uuid') boardUuid: string) {
    return this.boardsService.findOne(boardUuid);
  }

  @Public()
  @Patch(':board_uuid')
  @ApiOperation({ summary: 'Update board by board_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Board has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Board not found.',
  })
  update(
    @Param('board_uuid') boardUuid: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardUuid, updateBoardDto);
  }

  @Public()
  @Delete(':board_uuid')
  @ApiOperation({ summary: 'Remove board by board_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Board has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Board not found.',
  })
  remove(@Param('board_uuid') boardUuid: string) {
    return this.boardsService.remove(boardUuid);
  }
}
