import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MatchUserProfileGuard } from './match-user-profile.guard';
import { ProfilesService } from '../profiles.service';

import type { ExecutionContext } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import type { Profile } from '@prisma/client';

describe('MatchUserProfileGuard', () => {
  const userUuid = 'user uuid';
  const profileUuid = 'profile uuid';
  let guard: MatchUserProfileGuard;
  let profilesService: ProfilesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ProfilesService, useValue: {} }],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);

    guard = new MatchUserProfileGuard(profilesService);
  });

  it('throw bad request when profile uuid not include', async () => {
    const context = createExecutionContext({ user: { uuid: userUuid } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw bad request when user uuid not include (body)', async () => {
    const context = createExecutionContext({
      body: { profile_uuid: profileUuid },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw bad request when user uuid not include (query)', async () => {
    const context = createExecutionContext({
      query: { profile_uuid: profileUuid },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw bad request when user uuid not include (params)', async () => {
    const context = createExecutionContext({
      params: { profile_uuid: profileUuid },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw forbidden when profile not found', async () => {
    const context = createExecutionContext({
      user: { uuid: userUuid },
      params: { profile_uuid: profileUuid },
    });
    profilesService.findProfileByProfileUuid = jest.fn(async () => null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("throw forbidden when profile not user's profile", async () => {
    const context = createExecutionContext({
      user: { uuid: userUuid },
      params: { profile_uuid: profileUuid },
    });
    profilesService.findProfileByProfileUuid = jest.fn(
      async () => ({ userUuid: 'other user uuid' }) as Profile,
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('return true when valid user', async () => {
    const context = createExecutionContext({
      user: { uuid: userUuid },
      params: { profile_uuid: profileUuid },
    });
    profilesService.findProfileByProfileUuid = jest.fn(
      async () => ({ userUuid }) as Profile,
    );

    await expect(guard.canActivate(context)).resolves.toBeTruthy();
  });
});

function createExecutionContext(request: object): ExecutionContext {
  const innerRequest = {
    body: {},
    params: {},
    query: {},
    ...request,
  };
  const context: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => innerRequest,
    }),
  } as ExecutionContext;
  return context;
}
