import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { sign } from 'jsonwebtoken';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { BoardTreesModule } from '../src/board-trees/board-trees.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

const PORT = 3000;

describe('BoardTreesGateway (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('socket connection authentication', () => {
    const serverUrl = `ws://localhost:${PORT}/board`;

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
      const testUser = await prisma.user.create({ data: { uuid: uuid() } });
      const testToken = sign(
        { sub: testUser.uuid },
        config.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

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
    const serverUrl = `ws://localhost:${PORT}/board`;
    let testToken: string;

    beforeEach(async () => {
      const testUser = await prisma.user.create({ data: { uuid: uuid() } });
      testToken = sign(
        { sub: testUser.uuid },
        config.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );
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
});
