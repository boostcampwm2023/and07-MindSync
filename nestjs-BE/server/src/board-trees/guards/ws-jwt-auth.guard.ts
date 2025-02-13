import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToWs().getData();
    if (!request.token) {
      throw new WsException('access token required');
    }
    try {
      const payload = this.jwtService.verify(request.token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      request.user = { uuid: payload.sub };
    } catch (error) {
      throw new WsException('access token invalid');
    }
    return true;
  }
}
