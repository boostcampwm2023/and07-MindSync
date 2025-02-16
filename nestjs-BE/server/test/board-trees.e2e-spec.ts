import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile } from '@prisma/client';
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

type WsException = {
  status: string;
  message: string;
  cause: {
    pattern: string;
    data: object;
  };
};

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
      const testUser = await createUser(prisma);
      const testToken = await createUserToken(testUser.uuid, config);

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
      const testUser = await createUser(prisma);
      testToken = await createUserToken(testUser.uuid, config);
    });

    it('boardIdRequired error when board id not included', async () => {
      const error = new Promise((resolve, reject) => {
        const socket = io(serverUrl, {
          auth: { token: testToken },
        });
        socket.on('boardIdRequired', (error) => {
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
        socket.on('boardJoined', (boardId) => {
          socket.disconnect();
          resolve(boardId);
        });
      });

      expect(response).toBe(boardId);
    });
  });

  describe('Checking if WsJwtAuthGuard is applied', () => {
    const boardId = uuid();
    let client: Socket;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      const testToken = await createUserToken(testUser.uuid, config);
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

    it('createOperation', async () => {
      const testOperation = {
        boardId,
        type: 'add',
        parentId: 'root',
        content: 'new node',
      };

      const response: WsException = await new Promise((resolve) => {
        client.on('exception', (exception) => {
          resolve(exception);
        });
        client.emit('createOperation', { operation: testOperation });
      });

      expect(response.status).toBe('error');
      expect(response.message).toBe('access token required');
      expect(response.cause.pattern).toBe('createOperation');
    });

    it('getOperations', async () => {
      const response: WsException = await new Promise((resolve) => {
        client.on('exception', (exception) => {
          resolve(exception);
        });
        client.emit('getOperations', { boardId });
      });

      expect(response.status).toBe('error');
      expect(response.message).toBe('access token required');
      expect(response.cause.pattern).toBe('getOperations');
    });
  });

  describe('Checking if WsMatchUserProfileGuard is applied', () => {
    const boardId = uuid();
    let testToken: string;
    let client: Socket;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      testToken = await createUserToken(testUser.uuid, config);
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

    it('createOperation', async () => {
      const response: WsException = await new Promise((resolve, reject) => {
        client.on('exception', (exception) => {
          resolve(exception);
        });
        client.emit('createOperation', { token: testToken }, (response) => {
          reject(response);
        });
      });

      expect(response.status).toBe('error');
      expect(response.message).toBe('profile uuid or user uuid required');
      expect(response.cause.pattern).toBe('createOperation');
    });

    it('getOperations', async () => {
      const response: WsException = await new Promise((resolve, reject) => {
        client.on('exception', (exception) => {
          resolve(exception);
        });
        client.emit('getOperations', { token: testToken }, (response) => {
          reject(response);
        });
      });

      expect(response.status).toBe('error');
      expect(response.message).toBe('profile uuid or user uuid required');
      expect(response.cause.pattern).toBe('getOperations');
    });
  });

  describe('createOperation', () => {
    const boardId = 'board id';
    let testProfile: Profile;
    let testToken: string;
    let client: Socket;

    beforeEach(async () => {
      const user = await createUser(prisma);
      testProfile = await createProfile(user.uuid, prisma);
      testToken = await createUserToken(user.uuid, config);
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

      await new Promise((resolve, reject) => {
        client.on('exception', (exception) => {
          reject(exception);
        });
        client.emit(
          'createOperation',
          {
            operation: testOperation,
            token: testToken,
            profileUuid: testProfile.uuid,
          },
          (response) => {
            resolve(response);
          },
        );
      });

      const operations = await boardTreesService.getOperationLogs(
        testOperation.boardId,
      );
      expect(operations).toContainEqual(testOperation);
    });

    it('other client received operation', async () => {
      const otherUser = await createUser(prisma);
      const otherToken = await createUserToken(otherUser.uuid, config);
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

      const response = new Promise((resolve, reject) => {
        otherClient.on('operation', (operation) => {
          otherClient.disconnect();
          resolve(operation);
        });
        client.on('exception', (exception) => {
          otherClient.disconnect();
          reject(exception);
        });

        client.emit('createOperation', {
          operation: testOperation,
          token: testToken,
          profileUuid: testProfile.uuid,
        });
      });

      await expect(response).resolves.toEqual(testOperation);
    });
  });

  describe('getOperations', () => {
    const boardId = uuid();
    let testToken: string;
    let testProfile: Profile;
    let testOperations: BoardOperation[];
    let client: Socket;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      testProfile = await createProfile(testUser.uuid, prisma);
      testToken = await createUserToken(testUser.uuid, config);
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
      const response = new Promise((resolve, reject) => {
        client.on('exception', (exception) => {
          reject(exception);
        });
        client.emit(
          'getOperations',
          { boardId, token: testToken, profileUuid: testProfile.uuid },
          (response: BoardOperation[]) => {
            resolve(response);
          },
        );
      });

      await expect(response).resolves.toEqual(
        expect.arrayContaining(testOperations),
      );
    });
  });
});

async function createUser(prisma: PrismaService) {
  return prisma.user.create({ data: { uuid: uuid() } });
}

async function createProfile(userUuid: string, prisma: PrismaService) {
  return prisma.profile.create({
    data: {
      uuid: uuid(),
      userUuid,
      image: 'test image',
      nickname: 'test nickname',
    },
  });
}

async function createUserToken(userUuid: string, config: ConfigService) {
  const token = sign(
    { sub: userUuid },
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
    client.on('boardJoined', () => {
      resolve(null);
    });
  });
  return client;
}
