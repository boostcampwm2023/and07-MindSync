import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { sign } from 'jsonwebtoken';
import { JwtAuthGuard } from './jwt-auth.guard';

import type { ExecutionContext } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

const JWT_ACCESS_SECRET = 'access token secret';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        { provide: ConfigService, useValue: { get: () => JWT_ACCESS_SECRET } },
      ],
    }).compile();

    const jwtService = module.get<JwtService>(JwtService);
    const configService = module.get<ConfigService>(ConfigService);

    guard = new JwtAuthGuard(jwtService, configService);
  });

  it('throw WsException when token not included', () => {
    const context: ExecutionContext = {
      switchToWs: () => ({
        getData: () => ({}),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(WsException);
  });

  it('throw WsException if token is invalid', () => {
    const testToken = sign({ sub: 'test uuid' }, JWT_ACCESS_SECRET, {
      expiresIn: '-5m',
    });
    const context: ExecutionContext = {
      switchToWs: () => ({
        getData: () => ({ token: testToken }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(WsException);
  });

  it('return true if token is valid', () => {
    const testToken = sign({ sub: 'test uuid' }, JWT_ACCESS_SECRET, {
      expiresIn: '5m',
    });
    const context: ExecutionContext = {
      switchToWs: () => ({
        getData: () => ({ token: testToken }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBeTruthy();
  });
});
