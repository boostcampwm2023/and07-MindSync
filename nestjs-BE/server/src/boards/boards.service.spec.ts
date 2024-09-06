import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { getModelToken } from '@nestjs/mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Model, Query } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';

describe('BoardsService', () => {
  let service: BoardsService;
  let model: Model<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getModelToken(Board.name),
          useValue: { create: jest.fn(), find: jest.fn() },
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
    jest
      .spyOn(model, 'create')
      .mockResolvedValue('created board' as unknown as BoardDocument[]);

    const board = service.create(data, imageMock);

    await expect(board).resolves.toBe('created board');
    expect(model.create).toHaveBeenCalled();
  });

  it('findBySpaceId', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: async () => {
        return 'board list' as unknown as Board[];
      },
    } as Query<Board[], BoardDocument>);

    const boards = service.findBySpaceId('space uuid');

    await expect(boards).resolves.toBe('board list');
  });
});
