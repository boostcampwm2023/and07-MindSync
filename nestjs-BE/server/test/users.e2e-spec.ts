import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;
  let testToken: string;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    await prisma.user.deleteMany({});

    testUser = await prisma.user.create({ data: { uuid: uuid() } });
    testToken = sign(
      { sub: testUser.uuid },
      configService.get<string>('JWT_ACCESS_SECRET'),
      { expiresIn: '5m' },
    );
  });

  beforeEach(async () => {
    await prisma.profileSpace.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.space.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('users/spaces (GET)', () => {
    it('success', async () => {
      const SPACE_NUMBER = 5;

      const profile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: testUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });
      const spacePromises = Array.from({ length: SPACE_NUMBER }, async () => {
        const space = await prisma.space.create({
          data: { uuid: uuid(), name: 'test space', icon: 'test icon' },
        });
        await prisma.profileSpace.create({
          data: {
            profileUuid: profile.uuid,
            spaceUuid: space.uuid,
          },
        });
        return space;
      });
      const spaces = await Promise.all(spacePromises);

      return request(app.getHttpServer())
        .get('/users/spaces')
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.message).toBe('OK');
          expect(res.body.data).toEqual(expect.arrayContaining(spaces));
        });
    });

    it('no joined spaces', async () => {
      return request(app.getHttpServer())
        .get('/users/spaces')
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({ statusCode: HttpStatus.OK, message: 'OK', data: [] });
    });

    it('user not logged in', async () => {
      return request(app.getHttpServer())
        .get('/users/spaces')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
    });
  });
});
