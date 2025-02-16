import { Test } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { WsMatchUserProfileGuard } from './ws-match-user-profile.guard';
import { ProfilesService } from '../../profiles/profiles.service';

import type { ExecutionContext } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

describe('WsMatchUserProfileGuard', () => {
  let guard: WsMatchUserProfileGuard;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfilesService,
          useValue: {
            findProfileByProfileUuid: jest.fn(() => ({
              userUuid: 'user uuid',
            })),
          },
        },
      ],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);

    guard = new WsMatchUserProfileGuard(profilesService);
  });

  it('throw WsException when user uuid not included', async () => {
    const context = createExecutionContext({});
    Reflect.defineMetadata('user', { uuid: 'user uuid' }, context);

    const res = guard.canActivate(context);

    await expect(res).rejects.toThrow(WsException);
    await expect(res).rejects.toMatchObject({
      message: 'profile uuid or user uuid required',
    });
  });

  it('throw WsException when profile uuid not included', async () => {
    const context = createExecutionContext({ profileUuid: 'profile uuid' });

    const res = guard.canActivate(context);

    await expect(res).rejects.toThrow(WsException);
    await expect(res).rejects.toMatchObject({
      message: 'profile uuid or user uuid required',
    });
  });

  it('bad request if profile not exist', async () => {
    const context = createExecutionContext({ profileUuid: 'profile uuid' });
    Reflect.defineMetadata('user', { uuid: 'user uuid' }, context);
    (profilesService.findProfileByProfileUuid as jest.Mock).mockReturnValueOnce(
      null,
    );

    const res = guard.canActivate(context);

    await expect(res).rejects.toThrow(WsException);
    await expect(res).rejects.toMatchObject({
      message: 'forbidden request',
    });
  });

  it('bad request if profile uuid not match', async () => {
    const context = createExecutionContext({ profileUuid: 'profile uuid' });
    Reflect.defineMetadata('user', { uuid: 'user uuid' }, context);
    (profilesService.findProfileByProfileUuid as jest.Mock).mockReturnValueOnce(
      { userUuid: 'other user uuid' },
    );

    const res = guard.canActivate(context);

    await expect(res).rejects.toThrow(WsException);
    await expect(res).rejects.toMatchObject({
      message: 'forbidden request',
    });
  });

  it('success', async () => {
    const context = createExecutionContext({ profileUuid: 'profile uuid' });
    Reflect.defineMetadata('user', { uuid: 'user uuid' }, context);

    await expect(guard.canActivate(context)).resolves.toBeTruthy();
  });
});

function createExecutionContext(payload: object): ExecutionContext {
  const innerPayload = { ...payload };
  const context: ExecutionContext = {
    switchToWs: () => ({
      getData: () => innerPayload,
    }),
  } as ExecutionContext;
  return context;
}
