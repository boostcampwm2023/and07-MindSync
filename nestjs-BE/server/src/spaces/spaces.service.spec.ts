import { Test, TestingModule } from '@nestjs/testing';
import { SpacesService } from './spaces.service';
import { Space } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('SpacesService', () => {
  let spacesService: SpacesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        {
          provide: PrismaService,
          useValue: {
            space: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    spacesService = module.get<SpacesService>(SpacesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findSpace found space', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(prisma.space, 'findUnique').mockResolvedValue(spaceMock);

    const space = spacesService.findSpace('space uuid');

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('findSpace not found space', async () => {
    jest.spyOn(prisma.space, 'findUnique').mockResolvedValue(null);

    const space = spacesService.findSpace('bad space uuid');

    await expect(space).resolves.toBeNull();
  });

  it('findSpaces found spaces', async () => {
    const spaceUuidsMock = [
      { uuid: 'space uuid 1' },
      { uuid: 'space uuid 2' },
    ] as Space[];
    jest.spyOn(prisma.space, 'findMany').mockResolvedValue(spaceUuidsMock);

    const spaces = spacesService.findSpaces(['space uuid 1', 'space uuid 2']);

    await expect(spaces).resolves.toEqual(spaceUuidsMock);
  });

  it('findSpaces not found spaces', async () => {
    jest.spyOn(prisma.space, 'findMany').mockResolvedValue([]);

    const spaces = spacesService.findSpaces(['space uuid 1', 'space uuid 2']);

    await expect(spaces).resolves.toHaveLength(0);
  });

  it('createSpace created space', async () => {
    const data = { name: 'new space name', icon: 'new icon' };
    const spaceMock = { uuid: 'space uuid', ...data };
    jest.spyOn(prisma.space, 'create').mockResolvedValue(spaceMock);

    const space = spacesService.createSpace(data);

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('updateSpace updated space', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };
    const spaceMock = { uuid: 'space uuid', ...data };
    jest.spyOn(prisma.space, 'update').mockResolvedValue(spaceMock);

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('updateSpace fail', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };
    jest
      .spyOn(prisma.space, 'update')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'An operation failed because it depends on one or more records that were required but not found. Record to update not found.',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toBeNull();
  });

  it('deleteSpace deleted spaced', async () => {
    const spaceMock = { uuid: 'space uuid' } as Space;
    jest.spyOn(prisma.space, 'delete').mockResolvedValue(spaceMock);

    const space = spacesService.deleteSpace('space uuid');

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('deleteSpace fail', async () => {
    jest
      .spyOn(prisma.space, 'delete')
      .mockRejectedValue(
        new PrismaClientKnownRequestError(
          'An operation failed because it depends on one or more records that were required but not found. Record to delete not found.',
          { code: 'P2025', clientVersion: '' },
        ),
      );

    const space = spacesService.deleteSpace('space uuid');

    await expect(space).rejects.toThrow(PrismaClientKnownRequestError);
  });
});
