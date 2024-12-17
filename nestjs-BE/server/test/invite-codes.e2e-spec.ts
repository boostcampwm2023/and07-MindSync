import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InviteCode, Profile, Space } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { InviteCodesModule } from '../src/invite-codes/invite-codes.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { generateRandomString } from '../src/utils/random-string';
import {
  INVITE_CODE_EXPIRY_HOURS,
  INVITE_CODE_LENGTH,
} from '../src/config/constants';
import { getExpiryDate } from '../src/utils/date';

describe('InviteController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [InviteCodesModule, ConfigModule.forRoot({ isGlobal: true })],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/inviteCodes (POST)', () => {
    let testToken: string;
    let testSpace: Space;
    let testProfile: Profile;

    beforeAll(async () => {
      const testUser = await prisma.user.create({ data: { uuid: uuid() } });
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

    it('create invite code', () => {
      return request(app.getHttpServer())
        .post('/inviteCodes')
        .auth(testToken, { type: 'bearer' })
        .send({ profile_uuid: testProfile.uuid, space_uuid: testSpace.uuid })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.message).toBe('Created');
          expect(res.body.data.invite_code).toMatch(/^[A-Za-z0-9]{10}$/);
        });
    });
  });

  describe('/inviteCodes/:inviteCode (GET)', () => {
    let testToken: string;
    let testSpace: Space;
    let testInviteCode: InviteCode;

    beforeAll(async () => {
      const testUser = await prisma.user.create({ data: { uuid: uuid() } });
      testSpace = await prisma.space.create({
        data: {
          uuid: uuid(),
          name: 'test space',
          icon: configService.get<string>('APP_ICON_URL'),
        },
      });
      testToken = sign(
        { sub: testUser.uuid },
        configService.get<string>('JWT_ACCESS_SECRET'),
        { expiresIn: '5m' },
      );
      testInviteCode = await prisma.inviteCode.create({
        data: {
          uuid: uuid(),
          inviteCode: generateRandomString(INVITE_CODE_LENGTH),
          spaceUuid: testSpace.uuid,
          expiryDate: getExpiryDate({ hour: INVITE_CODE_EXPIRY_HOURS }),
        },
      });
    });

    it('get space by invite code', () => {
      return request(app.getHttpServer())
        .get(`/inviteCodes/${testInviteCode.inviteCode}`)
        .auth(testToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect({
          statusCode: HttpStatus.OK,
          message: 'Success',
          data: testSpace,
        });
    });
  });
});
