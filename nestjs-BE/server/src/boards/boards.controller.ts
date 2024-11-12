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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { RestoreBoardDto } from './dto/restore-board.dto';
import {
  BoardListSuccess,
  CreateBoardSuccess,
  DeleteBoardFailure,
  DeleteBoardSuccess,
  RestoreBoardFailure,
  RestoreBoardSuccess,
} from './swagger/boards.type';
import { Public } from '../auth/decorators/public.decorator';

@Controller('boards')
@ApiTags('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @ApiOperation({
    summary: '보드 생성',
    description: '보드 이름, 스페이스 id, 이미지 url을 받아서 보드를 생성한다.',
  })
  @ApiBody({ type: CreateBoardDto })
  @ApiCreatedResponse({
    type: CreateBoardSuccess,
    description: '보드 생성 완료',
  })
  @Public()
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const document = await this.boardsService.createBoard(
      createBoardDto,
      image,
    );
    const responseData = {
      boardId: document.uuid,
      date: document.createdAt,
      imageUrl: document.imageUrl,
    };
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Board created.',
      data: responseData,
    };
  }

  @ApiOperation({
    summary: '보드 목록 불러오기',
    description: '스페이스 id를 받아서 보드 목록을 불러온다.',
  })
  @ApiQuery({
    name: 'spaceId',
    required: true,
    description: '보드 목록을 불러올 스페이스 id',
  })
  @ApiOkResponse({
    type: BoardListSuccess,
    description: '보드 목록 불러오기 완료',
  })
  @Public()
  @Get('list')
  async findBySpaceId(@Query('spaceId') spaceId: string) {
    const boardList = await this.boardsService.findBySpaceId(spaceId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved board list.',
      data: boardList,
    };
  }

  @ApiOperation({
    summary: '보드 삭제',
    description: '삭제할 보드 id를 받아서 보드를 삭제한다.',
  })
  @ApiBody({ type: DeleteBoardDto })
  @ApiOkResponse({ type: DeleteBoardSuccess, description: '보드 삭제 완료' })
  @ApiNotFoundResponse({
    type: DeleteBoardFailure,
    description: '보드가 존재하지 않음',
  })
  @Public()
  @Patch('delete')
  async deleteBoard(@Body() deleteBoardDto: DeleteBoardDto) {
    const updateResult = await this.boardsService.deleteBoard(
      deleteBoardDto.boardId,
    );
    if (!updateResult.matchedCount) {
      throw new NotFoundException('Target board not found.');
    }
    return { statusCode: HttpStatus.OK, message: 'Board deleted.' };
  }

  @ApiOperation({
    summary: '보드 복구',
    description: '복구할 보드 id를 받아서 보드를 복구한다.',
  })
  @ApiBody({ type: RestoreBoardDto })
  @ApiOkResponse({ type: RestoreBoardSuccess, description: '보드 복구 완료' })
  @ApiNotFoundResponse({
    type: RestoreBoardFailure,
    description: '보드가 존재하지 않음',
  })
  @Public()
  @Patch('restore')
  async restoreBoard(@Body() resotreBoardDto: RestoreBoardDto) {
    const updateResult = await this.boardsService.restoreBoard(
      resotreBoardDto.boardId,
    );
    if (!updateResult.matchedCount) {
      throw new NotFoundException('Target board not found.');
    }
    return { statusCode: HttpStatus.OK, message: 'Board restored.' };
  }
}
