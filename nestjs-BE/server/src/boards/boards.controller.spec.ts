import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateWriteOpResult } from 'mongoose';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from './schemas/board.schema';
import { UploadService } from '../upload/upload.service';
import { CreateBoardDto } from './dto/create-board.dto';

describe('BoardsController', () => {
  let controller: BoardsController;
  let boardsService: BoardsService;
  let uploadService: UploadService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: {
            create: jest.fn(),
            deleteBoard: jest.fn(),
            restoreBoard: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
    boardsService = module.get<BoardsService>(BoardsService);
    uploadService = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('createBoard created board', async () => {
    const bodyMock = {
      boardName: 'board name',
      spaceId: 'space uuid',
    } as CreateBoardDto;
    const imageMock = { filename: 'image' } as Express.Multer.File;
    jest.spyOn(uploadService, 'uploadFile').mockResolvedValue('image url');
    jest.spyOn(boardsService, 'create').mockResolvedValue({
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
    jest.spyOn(boardsService, 'create').mockResolvedValue({
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
        imageUrl: configService.get<string>('APP_ICON_URL'),
      },
    });
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
  });

  it('deleteBoard success', async () => {
    const bodyMock = { boardId: 'board uuid' };
    jest.spyOn(boardsService, 'deleteBoard').mockResolvedValue({
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
    jest.spyOn(boardsService, 'deleteBoard').mockResolvedValue({
      matchedCount: 0,
    } as UpdateWriteOpResult);

    const response = controller.deleteBoard(bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });

  it('restoreBoard success', async () => {
    const bodyMock = { boardId: 'board uuid' };
    jest.spyOn(boardsService, 'restoreBoard').mockResolvedValue({
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
    jest.spyOn(boardsService, 'restoreBoard').mockResolvedValue({
      matchedCount: 0,
    } as UpdateWriteOpResult);

    const response = controller.restoreBoard(bodyMock);

    await expect(response).rejects.toThrow(NotFoundException);
  });
});
