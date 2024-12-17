import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ProfilesService } from '../../profiles/profiles.service';

@Injectable()
export class MatchUserProfileGuard implements CanActivate {
  constructor(private profilesService: ProfilesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userUuid = request.user.uuid;
    const profileUuid = request.body.profile_uuid || request.query.profileUuid;
    if (!profileUuid || !userUuid) {
      throw new ForbiddenException();
    }
    const profile =
      await this.profilesService.findProfileByProfileUuid(profileUuid);
    if (!profile || userUuid !== profile.userUuid) {
      throw new ForbiddenException();
    }
    return true;
  }
}
