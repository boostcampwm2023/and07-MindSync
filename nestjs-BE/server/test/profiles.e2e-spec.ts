import { HttpStatus } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { resolve } from 'path';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProfilesModule } from '../src/profiles/profiles.module';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import type { Profile } from '@prisma/client';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProfilesModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Checking if JwtAuthGuard is applied', () => {
    it('/profiles (GET)', () => {
      return request(app.getHttpServer())
        .get('/profiles')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
    });

    it('/profiles (PATCH)', async () => {
      const testUser = await createUser(prisma);
      const testProfile = await createProfile(testUser.uuid, prisma);

      return request(app.getHttpServer())
        .patch(`/profiles/${testProfile.uuid}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
    });
  });

  describe('Checking if MatchUserProfileGuard is applied', () => {
    let testToken: string;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      testToken = createToken(testUser.uuid, config);
      await createProfile(testUser.uuid, prisma);
    });

    it('/profiles (PATCH)', async () => {
      return request(app.getHttpServer())
        .patch(`/profiles/${uuid()}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
        });
    });
  });

  describe('/profiles (GET)', () => {
    const path = '/profiles';
    let testToken: string;
    let testProfile: Profile;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      testToken = createToken(testUser.uuid, config);
      testProfile = await createProfile(testUser.uuid, prisma);
    });

    it('success', () => {
      return request(app.getHttpServer())
        .get(path)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({
          statusCode: HttpStatus.OK,
          message: 'Success',
          data: omit(testProfile, ['userUuid']),
        });
    });
  });

  describe('/profiles (PATCH)', () => {
    let testToken: string;
    let testProfile: Profile;
    let path: string;

    beforeEach(async () => {
      const testUser = await createUser(prisma);
      testToken = createToken(testUser.uuid, config);
      testProfile = await createProfile(testUser.uuid, prisma);
      path = `/profiles/${testProfile.uuid}`;
    });

    it('success without update', () => {
      return request(app.getHttpServer())
        .patch(path)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({
          statusCode: HttpStatus.OK,
          message: 'Success',
          data: omit(testProfile, ['userUuid']),
        });
    });

    it('success nickname update', () => {
      const newNickname = 'new nickname';

      return request(app.getHttpServer())
        .patch(path)
        .auth(testToken, { type: 'bearer' })
        .send({ nickname: newNickname })
        .expect(HttpStatus.OK)
        .expect({
          statusCode: HttpStatus.OK,
          message: 'Success',
          data: {
            ...omit(testProfile, ['userUuid']),
            nickname: newNickname,
          },
        });
    });

    it('success image update', async () => {
      const imageUrlPattern = `^https\\:\\/\\/${config.get<string>(
        'S3_BUCKET_NAME',
      )}\\.s3\\.${config.get<string>(
        'AWS_REGION',
      )}\\.amazonaws\\.com\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-`;
      const imageRegExp = new RegExp(imageUrlPattern);
      const testImage = await readFile(resolve(__dirname, './base_image.png'));

      return request(app.getHttpServer())
        .patch(path)
        .auth(testToken, { type: 'bearer' })
        .attach('image', testImage, 'base_image.png')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Success');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data.uuid).toBe(testProfile.uuid);
          expect(res.body.data.userUuid).toBeUndefined();
          expect(res.body.data.image).toMatch(imageRegExp);
          expect(res.body.data.nickname).toBe(testProfile.nickname);
        });
    });

    it('success update all', async () => {
      const newNickname = 'new nickname';
      const imageUrlPattern = `^https\\:\\/\\/${config.get<string>(
        'S3_BUCKET_NAME',
      )}\\.s3\\.${config.get<string>(
        'AWS_REGION',
      )}\\.amazonaws\\.com\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-`;
      const imageRegExp = new RegExp(imageUrlPattern);
      const testImage = await readFile(resolve(__dirname, './base_image.png'));

      return request(app.getHttpServer())
        .patch(path)
        .auth(testToken, { type: 'bearer' })
        .attach('image', testImage, 'base_image.png')
        .field('nickname', newNickname)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Success');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data.uuid).toBe(testProfile.uuid);
          expect(res.body.data.userUuid).toBeUndefined();
          expect(res.body.data.image).toMatch(imageRegExp);
          expect(res.body.data.nickname).toBe(newNickname);
        });
    });
  });
});

async function createUser(prisma: PrismaService) {
  return prisma.user.create({ data: { uuid: uuid() } });
}

function createToken(userUuid: string, config: ConfigService) {
  return sign({ sub: userUuid }, config.get<string>('JWT_ACCESS_SECRET'), {
    expiresIn: '5m',
  });
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
