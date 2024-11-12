import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { BoardsService } from './boards.service';
import { Board } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UploadService } from '../upload/upload.service';

describe('BoardsService', () => {
  let service: BoardsService;
  let model: Model<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        BoardsService,
        {
          provide: getModelToken(Board.name),
          useValue: { create: jest.fn(), find: jest.fn() },
        },
        {
          provide: UploadService,
          useValue: { uploadFile: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    model = module.get(getModelToken(Board.name));
  });

  it('create', async () => {
    const data = {
      boardName: 'board name',
      spaceId: 'space uuid',
    } as CreateBoardDto;
    const imageMock = 'www.test.com/image';

    (model.create as jest.Mock).mockResolvedValue('created board');

    const board = service.create(data, imageMock);

    await expect(board).resolves.toBe('created board');
    expect(model.create).toHaveBeenCalled();
  });
});
