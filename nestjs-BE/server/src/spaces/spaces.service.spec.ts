import { Test, TestingModule } from '@nestjs/testing';
import { SpacesService } from './spaces.service';
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
          useValue: { space: { update: jest.fn() } },
        },
      ],
    }).compile();

    spacesService = module.get<SpacesService>(SpacesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('updateSpace updated space', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };
    const spaceMock = { uuid: 'space uuid', ...data };

    (prisma.space.update as jest.Mock).mockResolvedValue(spaceMock);

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toEqual(spaceMock);
  });

  it('updateSpace fail', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };

    (prisma.space.update as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '',
      }),
    );

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).resolves.toBeNull();
  });

  it('updateSpace fail', async () => {
    const data = { name: 'new space name', icon: 'new space icon' };

    (prisma.space.update as jest.Mock).mockRejectedValue(new Error());

    const space = spacesService.updateSpace('space uuid', data);

    await expect(space).rejects.toThrow(Error);
  });
});
