import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ProfileSpaceService } from '../../profile-space/profile-space.service';

@Injectable()
export class IsProfileInSpaceGuard implements CanActivate {
  constructor(private readonly profileSpaceService: ProfileSpaceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const profileUuid =
      request.body.profile_uuid ||
      request.query.profile_uuid ||
      request.params.profile_uuid;
    const spaceUuid = request.params.space_uuid;
    if (!profileUuid || !spaceUuid) throw new BadRequestException();
    const isProfileInSpace = await this.profileSpaceService.isProfileInSpace(
      profileUuid,
      spaceUuid,
    );
    if (!isProfileInSpace) throw new ForbiddenException();
    return true;
  }
}
