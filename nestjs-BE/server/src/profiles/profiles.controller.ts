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
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create profile' })
  @ApiResponse({
    status: 201,
    description: 'The profile has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Public()
  @Get(':profile_uuid')
  @ApiOperation({ summary: 'Get profile by profile_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the profile data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  findOne(@Param('profile_uuid') profileUuid: string) {
    return this.profilesService.findOne(profileUuid);
  }

  @Public()
  @Patch(':profile_uuid')
  @ApiOperation({ summary: 'Update profile by profile_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  update(
    @Param('profile_uuid') profileUuid: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(profileUuid, updateProfileDto);
  }

  @Public()
  @Delete(':profile_uuid')
  @ApiOperation({ summary: 'Remove profile by profile_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  remove(@Param('profile_uuid') profileUuid: string) {
    return this.profilesService.remove(profileUuid);
  }

  @Public()
  @Post('/spaces')
  @ApiOperation({ summary: 'Join space' })
  @ApiResponse({
    status: 201,
    description: 'Joined the space successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  joinSpace(@Body() profileSpaceDto: ProfileSpaceDto) {
    return this.profilesService.joinSpace(profileSpaceDto);
  }

  @Public()
  @Delete(':profile_uuid/spaces/:space_uuid')
  @ApiOperation({ summary: 'Leave space' })
  @ApiResponse({
    status: 200,
    description: 'Left the space successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile or space not found.',
  })
  leaveSpace(
    @Param('profile_uuid') profileUuid: string,
    @Param('space_uuid') spaceUuid: string,
  ) {
    return this.profilesService.leaveSpace(profileUuid, spaceUuid);
  }

  @Public()
  @Get('users/:space_uuid')
  @ApiOperation({ summary: 'Find users in a space' })
  @ApiResponse({
    status: 200,
    description: 'Return the list of users in the space.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  findUsers(@Param('space_uuid') spaceUuid: string) {
    return this.profilesService.findUsers(spaceUuid);
  }
}
