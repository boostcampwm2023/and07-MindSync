import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { sign } from 'jsonwebtoken';
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';

import type { ExecutionContext } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

const JWT_ACCESS_SECRET = 'access token secret';

describe('JwtAuthGuard', () => {
  let guard: WsJwtAuthGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        { provide: ConfigService, useValue: { get: () => JWT_ACCESS_SECRET } },
      ],
    }).compile();

    const jwtService = module.get<JwtService>(JwtService);
    const configService = module.get<ConfigService>(ConfigService);

    guard = new WsJwtAuthGuard(jwtService, configService);
  });

  it('throw WsException when token not included', () => {
    const context = createExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow(WsException);
  });

  it('throw WsException if token is invalid', () => {
    const testToken = sign({ sub: 'test uuid' }, JWT_ACCESS_SECRET, {
      expiresIn: '-5m',
    });
    const context = createExecutionContext({ token: testToken });

    expect(() => guard.canActivate(context)).toThrow(WsException);
  });

  it('return true if token is valid', () => {
    const testToken = sign({ sub: 'test uuid' }, JWT_ACCESS_SECRET, {
      expiresIn: '5m',
    });
    const context = createExecutionContext({ token: testToken });

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('add data when successful', () => {
    const testUuid = 'test uuid';
    const testToken = sign({ sub: testUuid }, JWT_ACCESS_SECRET, {
      expiresIn: '5m',
    });
    const context = createExecutionContext({ token: testToken });

    guard.canActivate(context);

    expect(Reflect.getMetadata('user', context)).toEqual({ uuid: testUuid });
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
