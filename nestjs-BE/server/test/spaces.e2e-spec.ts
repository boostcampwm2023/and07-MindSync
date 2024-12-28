import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile, Space, User } from '@prisma/client';
import * as request from 'supertest';
import { sign } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { AuthModule } from '../src/auth/auth.module';
import { SpacesModule } from '../src/spaces/spaces.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProfileSpaceModule } from '../src/profile-space/profile-space.module';

describe('SpacesController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let prisma: PrismaService;

  let testImage: Buffer;
  const uuidRegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  let imageRegExp: RegExp;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SpacesModule,
        AuthModule,
        ProfileSpaceModule,
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    testImage = await readFile(resolve(__dirname, './base_image.png'));
    const imageUrlPattern = `^https\\:\\/\\/${configService.get<string>(
      'S3_BUCKET_NAME',
    )}\\.s3\\.${configService.get<string>(
      'AWS_REGION',
    )}\\.amazonaws\\.com\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-`;
    imageRegExp = new RegExp(imageUrlPattern);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/spaces (POST)', () => {
    let testUser: User;
    let testProfile: Profile;
    let testToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({ data: { uuid: uuid() } });
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

    it('respond created when space create success', () => {
      const newSpace = { name: 'new test space', icon: testImage };

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Created');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.data.uuid).toMatch(uuidRegExp);
          expect(res.body.data.name).toBe(newSpace.name);
          expect(res.body.data.icon).toMatch(imageRegExp);
        });
    });

    it('respond created when request without space image', () => {
      const newSpace = { name: 'new test space' };

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .send({ name: newSpace.name, profile_uuid: testProfile.uuid })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Created');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.data.uuid).toMatch(uuidRegExp);
          expect(res.body.data.name).toBe(newSpace.name);
          expect(res.body.data.icon).toBe(
            configService.get<string>('APP_ICON_URL'),
          );
        });
    });

    it('respond bad request when request without profile uuid', () => {
      const newSpace = {
        name: 'new test space',
        icon: testImage,
        iconContentType: 'image/png',
      };

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .attach('icon', newSpace.icon, {
          contentType: newSpace.iconContentType,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
    });

    it('respond bad request when request without space name', () => {
      const newSpace = {
        icon: testImage,
        iconContentType: 'image/png',
      };

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, {
          contentType: newSpace.iconContentType,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
    });

    it('respond unauthorized when user is not logged in', () => {
      return request(app.getHttpServer())
        .post('/spaces')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden when user does not own profile', async () => {
      const newSpace = {
        name: 'new test space',
        icon: testImage,
        iconContentType: 'image/png',
      };
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', newProfile.uuid)
        .attach('icon', newSpace.icon, {
          contentType: newSpace.iconContentType,
        })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile not found', () => {
      const newSpace = {
        name: 'new test space',
        icon: testImage,
        iconContentType: 'image/png',
      };

      return request(app.getHttpServer())
        .post('/spaces')
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', uuid())
        .attach('icon', newSpace.icon, {
          contentType: newSpace.iconContentType,
        })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });
  });

  describe('/spaces/:space_uuid?profile_uuid={profile_uuid} (GET)', () => {
    let testUser: User;
    let testSpace: Space;
    let testProfile: Profile;
    let testToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({ data: { uuid: uuid() } });
      testProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: testUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
      await prisma.profileSpace.create({
        data: { spaceUuid: testSpace.uuid, profileUuid: testProfile.uuid },
      });
      testToken = sign(
        { sub: testUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );
    });

    it('respond ok if space found', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({
          message: 'OK',
          statusCode: HttpStatus.OK,
          data: testSpace,
        });
    });

    it('respond bad request if query profile_uuid needed', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
    });

    it('respond unauthorized if user is not logged in', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden if user does not have profile', async () => {
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newToken = sign(
        { sub: newUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}?profile_uuid=${testProfile.uuid}`)
        .auth(newToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden if profile does not exist', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}?profile_uuid=${uuid()}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden if profile does not join space', async () => {
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });
      const newToken = sign(
        { sub: newUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}?profile_uuid=${newProfile.uuid}`)
        .auth(newToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden if space does not exist', () => {
      return request(app.getHttpServer())
        .get(`/spaces/${uuid()}?profile_uuid=${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });
  });

  describe('/spaces/:space_uuid (PATCH)', () => {
    let testUser: User;
    let testProfile: Profile;
    let testSpace: Space;
    let testToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({ data: { uuid: uuid() } });
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
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
      await prisma.profileSpace.create({
        data: { profileUuid: testProfile.uuid, spaceUuid: testSpace.uuid },
      });
    });

    it('respond ok when space update success', async () => {
      const newSpace = { name: 'new test space', icon: testImage };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('OK');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data.uuid).toBe(testSpace.uuid);
          expect(res.body.data.name).toBe(newSpace.name);
          expect(res.body.data.icon).toMatch(imageRegExp);
        });
    });

    it('respond ok when request without name', async () => {
      const newSpace = { icon: testImage };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('OK');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data.uuid).toBe(testSpace.uuid);
          expect(res.body.data.name).toBe(testSpace.name);
          expect(res.body.data.icon).toMatch(imageRegExp);
        });
    });

    it('respond ok when request without icon', async () => {
      const newSpace = { name: 'new test space' };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .send({ name: newSpace.name, profile_uuid: testProfile.uuid })
        .expect(HttpStatus.OK)
        .expect({
          message: 'OK',
          statusCode: HttpStatus.OK,
          data: {
            uuid: testSpace.uuid,
            name: newSpace.name,
            icon: configService.get<string>('APP_ICON_URL'),
          },
        });
    });

    it('respond ok when request without icon (Content-Type multipart/form-data)', async () => {
      const newSpace = { name: 'new test space' };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', testProfile.uuid)
        .expect(HttpStatus.OK)
        .expect({
          message: 'OK',
          statusCode: HttpStatus.OK,
          data: {
            uuid: testSpace.uuid,
            name: newSpace.name,
            icon: configService.get<string>('APP_ICON_URL'),
          },
        });
    });

    it('respond bad request when profile uuid needed', async () => {
      const newSpace = { name: 'new test space', icon: testImage };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
    });

    it('respond bad request when icon is string', async () => {
      const newSpace = { name: 'new test space', icon: 'string value' };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .send({
          name: newSpace.name,
          icon: newSpace.icon,
          profile_uuid: testProfile.uuid,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('icon is string');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('respond bad request when icon is string (Content-Type: multipart/form-data)', async () => {
      const newSpace = { name: 'new test space', icon: 'string value' };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('icon', newSpace.icon)
        .field('profile_uuid', testProfile.uuid)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('icon is string');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('respond unauthorized when access token not include', async () => {
      const newSpace = { name: 'new test space', icon: testImage };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .field('name', newSpace.name)
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden when user does not own profile', async () => {
      const newSpace = { name: 'new test space', icon: testImage };
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newToken = sign(
        { sub: newUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(newToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', testProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile not joined space', async () => {
      const newSpace = { name: 'new test space', icon: testImage };
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });
      const newToken = sign(
        { sub: newUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(newToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', newProfile.uuid)
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile not found', () => {
      const newSpace = { name: 'new test space', icon: testImage };

      return request(app.getHttpServer())
        .patch(`/spaces/${testSpace.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .field('name', newSpace.name)
        .field('profile_uuid', uuid())
        .attach('icon', newSpace.icon, 'base_image.png')
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });
  });

  describe('/spaces/:space_uuid/profiles/:profile_uuid (POST)', () => {
    let testUser: User;
    let testProfile: Profile;
    let testSpace: Space;
    let testToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({ data: { uuid: uuid() } });
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
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
    });

    it('respond created when join success', async () => {
      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.CREATED)
        .expect({
          message: 'Created',
          statusCode: HttpStatus.CREATED,
          data: testSpace,
        });
    });

    it('respond not found when profile uuid needed', async () => {
      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.error).toBe('Not Found');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('respond unauthorized when user is not logged in', async () => {
      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden when user does not own profile', async () => {
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });

      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles/${newProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
        });
    });

    it('respond forbidden when space does not exist', async () => {
      return request(app.getHttpServer())
        .post(`/spaces/${uuid()}/profiles/${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
        });
    });

    it('respond not found when profile not found', async () => {
      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles/${uuid()}`)
        .auth(testToken, { type: 'bearer' })
        .send({ profile_uuid: uuid() })
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
        });
    });

    it('respond conflict when profile already joined space', async () => {
      await prisma.profileSpace.create({
        data: {
          spaceUuid: testSpace.uuid,
          profileUuid: testProfile.uuid,
        },
      });

      return request(app.getHttpServer())
        .post(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.CONFLICT)
        .expect({
          message: 'Conflict',
          statusCode: HttpStatus.CONFLICT,
        });
    });
  });

  describe('/spaces/:space_uuid/profiles/:profile_uuid (DELETE)', () => {
    let testUser: User;
    let testProfile: Profile;
    let testSpace: Space;
    let testToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({ data: { uuid: uuid() } });
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
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
      await prisma.profileSpace.create({
        data: {
          profileUuid: testProfile.uuid,
          spaceUuid: testSpace.uuid,
        },
      });
    });

    it('respond ok when leave space success', async () => {
      return request(app.getHttpServer())
        .delete(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({ message: 'OK', statusCode: HttpStatus.OK });
    });

    it('respond unauthorized when user is not logged in', async () => {
      return request(app.getHttpServer())
        .delete(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden when user does not own profile', async () => {
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });

      return request(app.getHttpServer())
        .delete(`/spaces/${testSpace.uuid}/profiles/${newProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile not found', async () => {
      return request(app.getHttpServer())
        .delete(`/spaces/${testSpace.uuid}/profiles/${uuid()}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile is not in space', async () => {
      await prisma.profileSpace.delete({
        where: {
          spaceUuid_profileUuid: {
            profileUuid: testProfile.uuid,
            spaceUuid: testSpace.uuid,
          },
        },
      });

      return request(app.getHttpServer())
        .delete(`/spaces/${testSpace.uuid}/profiles/${testProfile.uuid}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });
  });

  describe('/spaces/:space_uuid/profiles (GET)', () => {
    let testUsers: User[];
    let testProfiles: Profile[];
    let testSpace: Space;
    let testToken: string;

    beforeEach(async () => {
      const size = 5;

      testUsers = await Promise.all(
        Array.from({ length: size }, () =>
          prisma.user.create({ data: { uuid: uuid() } }),
        ),
      );
      testProfiles = await Promise.all(
        Array.from({ length: size }, (v, i) =>
          prisma.profile.create({
            data: {
              uuid: uuid(),
              userUuid: testUsers[i].uuid,
              image: 'test image',
              nickname: 'test nickname',
            },
          }),
        ),
      );
      testToken = sign(
        { sub: testUsers[0].uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
      await Promise.all(
        Array.from({ length: size }, (v, i) =>
          prisma.profileSpace.create({
            data: {
              profileUuid: testProfiles[i].uuid,
              spaceUuid: testSpace.uuid,
            },
          }),
        ),
      );
    });

    it('respond ok when success', async () => {
      return request(app.getHttpServer())
        .get(
          `/spaces/${testSpace.uuid}/profiles?profile_uuid=${testProfiles[0].uuid}`,
        )
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('OK');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toEqual(expect.arrayContaining(testProfiles));
        });
    });

    it('respond bad request when profile uuid needed', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}/profiles`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ message: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
    });

    it('respond unauthorized when user is not logged in', async () => {
      return request(app.getHttpServer())
        .get(
          `/spaces/${testSpace.uuid}/profiles?profile_uuid=${testProfiles[0].uuid}`,
        )
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
    });

    it('respond forbidden when user does not own profile', async () => {
      const newUser = await prisma.user.create({ data: { uuid: uuid() } });
      const newProfile = await prisma.profile.create({
        data: {
          uuid: uuid(),
          userUuid: newUser.uuid,
          image: 'test image',
          nickname: 'test nickname',
        },
      });

      return request(app.getHttpServer())
        .get(
          `/spaces/${testSpace.uuid}/profiles?profile_uuid=${newProfile.uuid}`,
        )
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden if profile not joined space', async () => {
      await prisma.profileSpace.delete({
        where: {
          spaceUuid_profileUuid: {
            profileUuid: testProfiles[0].uuid,
            spaceUuid: testSpace.uuid,
          },
        },
      });

      return request(app.getHttpServer())
        .get(
          `/spaces/${testSpace.uuid}/profiles?profile_uuid=${testProfiles[0].uuid}`,
        )
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });

    it('respond forbidden when profile not found', async () => {
      return request(app.getHttpServer())
        .get(`/spaces/${testSpace.uuid}/profiles?profile_uuid=${uuid()}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .expect({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
    });
  });
});
