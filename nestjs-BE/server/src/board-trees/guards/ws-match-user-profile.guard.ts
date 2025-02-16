import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ProfilesService } from '../../profiles/profiles.service';

@Injectable()
export class WsMatchUserProfileGuard implements CanActivate {
  constructor(private profilesService: ProfilesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToWs().getData();
    const userUuid = Reflect.getMetadata('user', context)?.uuid;
    const profileUuid = request.profileUuid;
    if (!profileUuid || !userUuid)
      throw new WsException('profile uuid or user uuid required');
    const profile =
      await this.profilesService.findProfileByProfileUuid(profileUuid);
    if (!profile || userUuid !== profile.userUuid) {
      throw new WsException('forbidden request');
    }
    return true;
  }
}
