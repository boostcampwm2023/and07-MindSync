import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { UploadService } from '../upload/upload.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Board } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import customEnv from '../config/env';
import { UpdateWriteOpResult } from 'mongoose';

describe('BoardsController', () => {
  let controller: BoardsController;
  let boardsService: DeepMockProxy<BoardsService>;
  let uploadService: DeepMockProxy<UploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [BoardsService, UploadService],
    })
      .overrideProvider(BoardsService)
      .useValue(mockDeep<BoardsService>())
      .overrideProvider(UploadService)
      .useValue(mockDeep<UploadService>())
      .compile();

    controller = module.get<BoardsController>(BoardsController);
    boardsService = module.get(BoardsService);
    uploadService = module.get(UploadService);
  });

  it('createBoard created board', async () => {
    const bodyMock = {
      boardName: 'board name',
      spaceId: 'space uuid',
    } as CreateBoardDto;
    const imageMock = { filename: 'image' } as Express.Multer.File;
    uploadService.uploadFile.mockResolvedValue('image url');
    boardsService.create.mockResolvedValue({
      uuid: 'board uuid',
      createdAt: 'created date' as unknown as Date,
    } as Board);

    const board = controller.createBoard(bodyMock, imageMock);

    await expect(board).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Board created.',
      data: {
        boardId: 'board uuid',
        date: 'created date',
        imageUrl: 'image url',
      },
    });
    expect(uploadService.uploadFile).toHaveBeenCalled();
  });

  it('createBoard request does not have image file', async () => {
    const bodyMock = {
      boardName: 'board name',
      spaceId: 'space uuid',
    } as CreateBoardDto;
    boardsService.create.mockResolvedValue({
      uuid: 'board uuid',
      createdAt: 'created date' as unknown as Date,
    } as Board);

    const response = controller.createBoard(
      bodyMock,
      null as unknown as Express.Multer.File,
    );

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Board created.',
      data: {
        boardId: 'board uuid',
        date: 'created date',
        imageUrl: customEnv.APP_ICON_URL,
      },
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
  });

  it('deleteBoard success', async () => {
    const bodyMock = { boardId: 'board uuid' };
    boardsService.deleteBoard.mockResolvedValue({
      matchedCount: 1,
    } as UpdateWriteOpResult);

    const response = controller.deleteBoard(bodyMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'Board deleted.',
    });
  });

  it('deleteBoard fail', async () => {
    const bodyMock = { boardId: 'board uuid' };
    boardsService.deleteBoard.mockResolvedValue({
      matchedCount: 0,
    } as UpdateWriteOpResult);

    const response = controller.deleteBoard(bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('restoreBoard success', async () => {
    const bodyMock = { boardId: 'board uuid' };
    boardsService.restoreBoard.mockResolvedValue({
      matchedCount: 1,
    } as UpdateWriteOpResult);

    const response = controller.restoreBoard(bodyMock);

    await expect(response).resolves.toEqual({
      statusCode: HttpStatus.OK,
      message: 'Board restored.',
    });
  });

  it('restoreBoard fail', async () => {
    const bodyMock = { boardId: 'board uuid' };
    boardsService.restoreBoard.mockResolvedValue({
      matchedCount: 0,
    } as UpdateWriteOpResult);

    const response = controller.restoreBoard(bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
