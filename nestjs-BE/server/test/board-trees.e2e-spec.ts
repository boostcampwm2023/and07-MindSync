import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { sign } from 'jsonwebtoken';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { BoardTreesModule } from '../src/board-trees/board-trees.module';
import { BoardTreesService } from '../src/board-trees/board-trees.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import type { BoardOperation } from '../src/board-trees/schemas/board-operation.schema';

const PORT = 3000;

describe('BoardTreesGateway (e2e)', () => {
  const serverUrl = `ws://localhost:${PORT}/board`;
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;
  let boardTreesService: BoardTreesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_DATABASE_URI'),
          }),
        }),
        BoardTreesModule,
        PrismaModule,
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();
    await app.listen(PORT);

    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
    boardTreesService = module.get<BoardTreesService>(BoardTreesService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('socket connection authentication', () => {
    it('fail when access token is not included', (done) => {
      const socket = io(serverUrl);

      socket.on('connect_error', (error) => {
        expect(error.message).toBe('access token required');
        done();
      });
    });

    it('fail when access token is invalid', async () => {
      const testUser = await prisma.user.create({ data: { uuid: uuid() } });
      const testToken = sign(
        { sub: testUser.uuid },
        config.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '-5m' },
      );

      const error = new Promise((resolve, reject) => {
        const socket = io(serverUrl, { auth: { token: testToken } });
        socket.on('connect_error', (error) => {
          reject(error);
        });
      });

      await expect(error).rejects.toHaveProperty('message', 'token is invalid');
    });

    it('success', async () => {
      const testToken = await createUserToken(prisma, config);

      const connected = await new Promise((resolve) => {
        const socket = io(serverUrl, { auth: { token: testToken } });
        socket.on('connect', () => {
          const connected = socket.connected;
          socket.disconnect();
          resolve(connected);
        });
      });

      expect(connected).toBeTruthy();
    });
  });

  describe('join board on connection', () => {
    let testToken: string;

    beforeEach(async () => {
      testToken = await createUserToken(prisma, config);
    });

    it('board_id_required error when board id not included', async () => {
      const error = new Promise((resolve, reject) => {
        const socket = io(serverUrl, {
          auth: { token: testToken },
        });
        socket.on('board_id_required', (error) => {
          reject(error);
        });
      });

      await expect(error).rejects.toHaveProperty(
        'message',
        'board id required',
      );
    });

    it('join board', async () => {
      const boardId = 'board id';

      const response = await new Promise((resolve) => {
        const socket = io(serverUrl, {
          auth: { token: testToken },
          query: { boardId },
        });
        socket.on('board_joined', (boardId) => {
          socket.disconnect();
          resolve(boardId);
        });
      });

      expect(response).toBe(boardId);
    });
  });

  describe('createOperation', () => {
    const boardId = 'board id';
    let testToken: string;
    let client: Socket;

    beforeEach(async () => {
      testToken = await createUserToken(prisma, config);
      client = await createClientSocket(serverUrl, {
        auth: { token: testToken },
        query: { boardId },
      });
    });

    afterEach(() => {
      if (client.connected) {
        client.disconnect();
      }
    });

    it('create operation', async () => {
      const testOperation = {
        boardId: uuid(),
        type: 'add',
        parentId: 'root',
        content: 'new node',
      };

      await new Promise((resolve) => {
        client.on('operationCreated', () => {
          resolve(null);
        });

        client.emit('createOperation', testOperation);
      });

      const operations = await boardTreesService.getOperationLogs(
        testOperation.boardId,
      );
      expect(operations).toContainEqual(testOperation);
    });

    it('other client received operation', async () => {
      const otherToken = await createUserToken(prisma, config);
      const otherClient = await createClientSocket(serverUrl, {
        auth: { token: otherToken },
        query: { boardId },
      });

      const testOperation = {
        boardId,
        type: 'add',
        parentId: 'root',
        content: 'new node',
      };

      const response = await new Promise((resolve) => {
        otherClient.on('operation', (operation) => {
          otherClient.disconnect();
          resolve(operation);
        });

        client.emit('createOperation', testOperation);
      });

      expect(response).toEqual(testOperation);
    });
  });

  describe('getOperations', () => {
    const boardId = uuid();
    let testToken: string;
    let testOperations: BoardOperation[];
    let client: Socket;

    beforeEach(async () => {
      testToken = await createUserToken(prisma, config);
      client = await createClientSocket(serverUrl, {
        auth: { token: testToken },
        query: { boardId },
      });

      testOperations = Array.from({ length: 5 }, () => {
        return {
          boardId,
          type: 'add',
          parentId: 'root',
          content: 'new node',
        } as BoardOperation;
      });
      await Promise.all(
        testOperations.map((operation) =>
          boardTreesService.createOperationLog(operation as BoardOperation),
        ),
      );
    });

    afterEach(() => {
      if (client.connected) {
        client.disconnect();
      }
    });

    it('get operation logs', async () => {
      const response = await new Promise((resolve) => {
        client.on('getOperations', (operationLogs) => {
          resolve(operationLogs);
        });

        client.emit('getOperations', boardId);
      });

      expect(response).toEqual(expect.arrayContaining(testOperations));
    });
  });
});

async function createUserToken(prisma: PrismaService, config: ConfigService) {
  const user = await prisma.user.create({ data: { uuid: uuid() } });
  const token = sign(
    { sub: user.uuid },
    config.get<string>('JWT_ACCESS_SECRET'),
    { expiresIn: '5m' },
  );
  return token;
}

async function createClientSocket(
  uri: string,
  opts: Partial<ManagerOptions & SocketOptions>,
) {
  let client: Socket;
  await new Promise((resolve) => {
    client = io(uri, opts);
    client.on('board_joined', () => {
      resolve(null);
    });
  });
  return client;
}
