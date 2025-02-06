import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardTreesModule } from '../src/board-trees/board-trees.module';
import { io } from 'socket.io-client';

const PORT = 3000;

describe('BoardTreesGateway (e2e)', () => {
  let app: INestApplication;

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
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('socket connection', () => {
    it('fail when access token is not included', (done) => {
      const socket = io(`ws://localhost:${PORT}/board`);

      socket.on('connect_error', (error) => {
        expect(error.message).toBe('access token required');
        done();
      });
    });
  });
});
