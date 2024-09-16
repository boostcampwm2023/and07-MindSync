import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);
    const prisma: PrismaService =
      moduleFixture.get<PrismaService>(PrismaService);

    const testUser = { email: 'test@email.com', provider: 'kakao' };
    prisma.user.upsert({
      where: {
        email_provider: { email: testUser.email, provider: testUser.provider },
      },
      update: {},
      create: {
        uuid: 'test uuid',
        email: testUser.email,
        provider: testUser.provider,
      },
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
    const invalidToken = sign(
      { sub: 'test uuid' },
      configService.get<string>('JWT_ACCESS_SECRET'),
      { expiresIn: '-5m' },
    );

    return request(app.getHttpServer())
      .get('/login-test')
      .auth(invalidToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: 401 });
  });

  it('/login-test (GET) expired access token', () => {
    const expiredToken = sign(
      { sub: 'test uuid' },
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
    const invalidToken = sign({ sub: 'test uuid' }, 'wrong jwt access token', {
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
      { sub: 'test uuid' },
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
