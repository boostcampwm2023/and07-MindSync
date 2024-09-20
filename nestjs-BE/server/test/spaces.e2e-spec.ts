import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { SpacesModule } from '../src/spaces/spaces.module';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { sign } from 'jsonwebtoken';
import { Profile, Space } from '@prisma/client';

describe('SpacesController (e2e)', () => {
  let app: INestApplication;
  let testToken: string;
  let testSpace: Space;
  let testProfile: Profile;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    const configService: ConfigService =
      module.get<ConfigService>(ConfigService);
    testToken = sign(
      { sub: 'test uuid' },
      configService.get<string>('JWT_ACCESS_SECRET'),
      { expiresIn: '5m' },
    );
    testSpace = {
      uuid: 'space-uuid',
      name: 'test space',
      icon: 'test space icon',
    };
    testProfile = {
      uuid: 'profile uuid',
      user_id: 'test uuid',
      image: configService.get<string>('BASE_IMAGE_URL'),
      nickname: 'test nickname',
    };
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

    const testUser = { email: 'test@email.com', provider: 'kakao' };
    await prisma.user.upsert({
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
    await prisma.profile.upsert({
      where: { user_id: 'test uuid' },
      update: {},
      create: {
        uuid: testProfile.uuid,
        user_id: testProfile.user_id,
        image: testProfile.image,
        nickname: testProfile.nickname,
      },
    });
    await prisma.space.upsert({
      where: {
        uuid: testSpace.uuid,
      },
      update: {},
      create: {
        uuid: testSpace.uuid,
        name: testSpace.name,
        icon: testSpace.icon,
      },
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
        expect(res.body.data.uuid).toMatch(/^[0-9a-f]{32}$/);
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
        expect(res.body.data.uuid).toMatch(/^[0-9a-f]{32}$/);
        expect(res.body.data.name).toBe('new test space');
        expect(res.body.data.icon).toMatch(imageRegExp);
      });
  });
});
