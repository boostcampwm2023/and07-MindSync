import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { SpacesModule } from '../src/spaces/spaces.module';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { sign } from 'jsonwebtoken';
import { Profile, Space } from '@prisma/client';
import { PrismaModule } from '../src/prisma/prisma.module';
import { v4 as uuid } from 'uuid';

describe('SpacesController (e2e)', () => {
  let app: INestApplication;
  let testToken: string;
  let testSpace: Space;
  let testProfile: Profile;
  let configService: ConfigService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, PrismaModule],
    }).compile();

    const configService: ConfigService =
      module.get<ConfigService>(ConfigService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});

    const testUser = await prisma.user.create({ data: { uuid: uuid() } });
    testProfile = await prisma.profile.create({
      data: {
        uuid: uuid(),
        userUuid: testUser.uuid,
        image: 'test image',
        nickname: 'test nickname',
      },
    });

    testToken = sign(
      { sub: testUser.uuid },
      configService.get<string>('JWT_ACCESS_SECRET'),
      { expiresIn: '5m' },
    );
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SpacesModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    const prisma: PrismaService =
      moduleFixture.get<PrismaService>(PrismaService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    await prisma.space.deleteMany({});
    await prisma.profileSpace.deleteMany({});

    testSpace = await prisma.space.create({
      data: { uuid: uuid(), name: 'test space', icon: 'test icon' },
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('/spaces (POST) not logged in', () => {
    return request(app.getHttpServer())
      .post('/spaces')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
  });

  it('/spaces (POST) without space name', () => {
    return request(app.getHttpServer())
      .post('/spaces')
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
  });

  it('/spaces (POST) without space image', () => {
    return request(app.getHttpServer())
      .post('/spaces')
      .auth(testToken, { type: 'bearer' })
      .send({ name: 'new test space' })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.message).toBe('Created');
        expect(res.body.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.data.uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        expect(res.body.data.name).toBe('new test space');
        expect(res.body.data.icon).toBe(
          configService.get<string>('APP_ICON_URL'),
        );
      });
  });

  it('/spaces (POST)', () => {
    const imageUrlPattern = `^https\\:\\/\\/${configService.get<string>(
      'S3_BUCKET_NAME',
    )}\\.s3\\.${configService.get<string>(
      'AWS_REGION',
    )}\\.amazonaws\\.com\\/[0-9a-f]{32}-`;
    const imageRegExp = new RegExp(imageUrlPattern);

    return request(app.getHttpServer())
      .post('/spaces')
      .auth(testToken, { type: 'bearer' })
      .field('name', 'new test space')
      .attach('icon', './test/base_image.png', { contentType: 'image/png' })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.message).toBe('Created');
        expect(res.body.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.data.uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        expect(res.body.data.name).toBe('new test space');
        expect(res.body.data.icon).toMatch(imageRegExp);
      });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) space found', async () => {
    await prisma.profileSpace.create({
      data: { spaceUuid: testSpace.uuid, profileUuid: testProfile.uuid },
    });

    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.OK)
      .expect({
        message: 'OK',
        statusCode: HttpStatus.OK,
        data: testSpace,
      });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) query profile_uuid needed', async () => {
    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) not logged in', async () => {
    await prisma.profileSpace.create({
      data: { spaceUuid: testSpace.uuid, profileUuid: testProfile.uuid },
    });

    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
  });

  it("/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) profile user doesn't have", async () => {
    const newUser = await prisma.user.create({ data: { uuid: uuid() } });
    const newProfile = await prisma.profile.create({
      data: {
        uuid: uuid(),
        userUuid: newUser.uuid,
        image: 'test image',
        nickname: 'test nickname',
      },
    });
    await prisma.profileSpace.create({
      data: { spaceUuid: testSpace.uuid, profileUuid: newProfile.uuid },
    });

    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}?profile_uuid=${newProfile.uuid}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
      .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) profile not existing', async () => {
    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}?profile_uuid=${uuid()}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
      .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) findOne profile not joined space', () => {
    return request(app.getHttpServer())
      .get(`/v2/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
      .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
  });

  it('/v2/spaces/:space_uuid?profile_uuid={profile_uuid} (GET) not existing space', () => {
    return request(app.getHttpServer())
      .get(`/v2/spaces/${uuid()}?profile_uuid=${testProfile.uuid}`)
      .auth(testToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND)
      .expect({ message: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
  });
});
