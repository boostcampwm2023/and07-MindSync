import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    testUser = await prisma.user.create({ data: { uuid: uuid() } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
  });

  describe('/login-test (GET)', () => {
    it('not logged in', () => {
      return request(app.getHttpServer())
        .get('/login-test')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ message: 'Unauthorized', statusCode: 401 });
    });

    it('expired access token', () => {
      const expiredToken = sign(
        { sub: testUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '-5m' },
      );

      return request(app.getHttpServer())
        .get('/login-test')
        .auth(expiredToken, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ message: 'Unauthorized', statusCode: 401 });
    });

    it('wrong user uuid access token', () => {
      // access token은 user uuid가 맞는지 검증할 수 없다.
      const wrongUserUuidToken = sign(
        { sub: 'wrong uuid' },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .get('/login-test')
        .auth(wrongUserUuidToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect('login success');
    });

    it('wrong secret access token', () => {
      const invalidToken = sign(
        { sub: testUser.uuid },
        'wrong jwt access token',
        {
          expiresIn: '5m',
        },
      );

      return request(app.getHttpServer())
        .get('/login-test')
        .auth(invalidToken, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({ message: 'Unauthorized', statusCode: 401 });
    });

    it('logged in', async () => {
      const testToken = sign(
        { sub: testUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .get('/login-test')
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect('login success');
    });
  });
});
