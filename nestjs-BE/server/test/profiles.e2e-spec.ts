import { HttpStatus } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
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
          data: testProfile,
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
