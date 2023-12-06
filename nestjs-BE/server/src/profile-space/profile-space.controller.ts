import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Request as Req,
} from '@nestjs/common';
import { ProfileSpaceService } from './profile-space.service';
import { CreateProfileSpaceDto } from './dto/create-profile-space.dto';
import { RequestWithUser } from 'src/utils/interface';
import { SpacesService } from 'src/spaces/spaces.service';

@Controller('profileSpace')
export class ProfileSpaceController {
  constructor(
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly spacesService: SpacesService,
  ) {}

  @Post()
  async create(
    @Body() createProfileSpaceDto: CreateProfileSpaceDto,
    @Req() req: RequestWithUser,
  ) {
    const userUuid = req.user.uuid;
    const { space_uuid } = createProfileSpaceDto;
    const { joinData, profileData } =
      await this.profileSpaceService.processData(userUuid, space_uuid);
    const responseData = await this.profileSpaceService.create(joinData);
    const data = await this.spacesService.processData(space_uuid, profileData);
    this.profileSpaceService.put(userUuid, space_uuid, data);
    return responseData;
  }

  @Delete(':space_uuid')
  async delete(
    @Param('space_uuid') spaceUuid: string,
    @Req() req: RequestWithUser,
  ) {
    const userUuid = req.user.uuid;
    const { joinData, profileData } =
      await this.profileSpaceService.processData(userUuid, spaceUuid);
    const data = await this.spacesService.processData(spaceUuid, profileData);
    this.profileSpaceService.delete(userUuid, spaceUuid, data);
    const key = this.profileSpaceService.generateKey(joinData);
    return this.profileSpaceService.remove(key);
  }
}
