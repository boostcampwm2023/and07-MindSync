import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let testUserUuid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);
    const prisma: PrismaService =
      moduleFixture.get<PrismaService>(PrismaService);

    await prisma.kakaoUser.deleteMany({});
    await prisma.user.deleteMany({});

    testUserUuid = uuid();
    await prisma.user.create({
      data: { uuid: testUserUuid },
    });
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

  it('/login-test (GET) not logged in', () => {
    return request(app.getHttpServer())
      .get('/login-test')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: 401 });
  });

  it('/login-test (GET) expired access token', () => {
    const expiredToken = sign(
      { sub: testUserUuid },
      configService.get<string>('JWT_ACCESS_SECRET'),
      { expiresIn: '-5m' },
    );

    return request(app.getHttpServer())
      .get('/login-test')
      .auth(expiredToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: 401 });
  });

  it('/login-test (GET) wrong user uuid access token', () => {
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

  it('/login-test (GET) wrong secret access token', () => {
    const invalidToken = sign({ sub: testUserUuid }, 'wrong jwt access token', {
      expiresIn: '5m',
    });

    return request(app.getHttpServer())
      .get('/login-test')
      .auth(invalidToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: 401 });
  });

  it('/login-test (GET) logged in', async () => {
    const testToken = sign(
      { sub: testUserUuid },
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
