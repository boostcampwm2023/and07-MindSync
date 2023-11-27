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
}
