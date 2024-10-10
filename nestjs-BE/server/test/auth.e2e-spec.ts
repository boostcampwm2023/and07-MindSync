import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let fetchSpy: jest.SpyInstance;

  beforeAll(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    fetchSpy.mockRestore();

    await app.close();
  });

  it('/auth/kakao-oauth (POST)', () => {
    fetchSpy.mockResolvedValue({
      json: async () => {
        return { kakao_account: { email: 'test@email.com' } };
      },
      ok: true,
    });

    return request(app.getHttpServer())
      .post('/auth/kakao-oauth')
      .send({ kakaoUserId: 1 })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.statusCode).toBe(HttpStatus.OK);
        expect(res.body.message).toBe('Success');
        expect(res.body.data.access_token).toMatch(
          /^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+$/,
        );
        expect(res.body.data.refresh_token).toMatch(
          /^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+$/,
        );
      });
  });

  it('/auth/kakao-oauth (POST) received wrong kakao user id', () => {
    fetchSpy.mockResolvedValue({
      json: async () => null,
      ok: false,
    });

    return request(app.getHttpServer())
      .post('/auth/kakao-oauth')
      .send({ kakaoUserId: 1 })
      .expect(HttpStatus.NOT_FOUND)
      .expect({ statusCode: HttpStatus.NOT_FOUND, message: 'Not Found' });
  });
});
