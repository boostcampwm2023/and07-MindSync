import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileSpaceDto } from './dto/profile-space.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.profilesService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(uuid, updateProfileDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.profilesService.remove(uuid);
  }

  @Post('/spaces')
  joinSpace(@Body() profileSpaceDto: ProfileSpaceDto) {
    return this.profilesService.joinSpace(profileSpaceDto);
  }

  @Delete(':profile_uuid/spaces/:space_uuid')
  leaveSpace(
    @Param('profile_uuid') profileUuid: string,
    @Param('space_uuid') spaceUuid: string,
  ) {
    return this.profilesService.leaveSpace(profileUuid, spaceUuid);
  }
}
