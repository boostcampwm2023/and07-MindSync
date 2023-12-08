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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { RestoreBoardDto } from './dto/restore-board.dto';
import {
  BoardListSuccess,
  CreateBoardFailure,
  CreateBoardSuccess,
  DeleteBoardFailure,
  DeleteBoardSuccess,
  RestoreBoardFailure,
  RestoreBoardSuccess,
} from './swagger/boards.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

const BOARD_EXPIRE_DAY = 7;

@Controller('boards')
@ApiTags('boards')
export class BoardsController {
  constructor(
    private boardsService: BoardsService,
    private uploadService: UploadService,
  ) {}

  @ApiOperation({
    summary: '보드 생성',
    description: '보드 이름, 스페이스 id, 이미지 url을 받아서 보드를 생성한다.',
  })
  @ApiBody({ type: CreateBoardDto })
  @ApiCreatedResponse({
    type: CreateBoardSuccess,
    description: '보드 생성 완료',
  })
  @ApiConflictResponse({
    type: CreateBoardFailure,
    description: '보드가 이미 존재함',
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
    await this.boardsService.findByNameAndSpaceId(
      createBoardDto.boardName,
      createBoardDto.spaceId,
    );
    const imageUrl = image ? await this.uploadService.uploadFile(image) : null;
    const document = await this.boardsService.create(createBoardDto, imageUrl);
    const responseData = {
      boardId: document.uuid,
      date: document.createdAt,
      imageUrl,
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
        imageUrl: board.imageUrl ? board.imageUrl : null,
        isDeleted,
      });
      return list;
    }, []);
    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved board list.',
      data: responseData,
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
