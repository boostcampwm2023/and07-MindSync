import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request as Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileSpaceDto } from './dto/profile-space.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from 'src/upload/upload.service';
import customEnv from 'src/config/env';
import { Request } from 'express';
const { BASE_IMAGE_URL } = customEnv;

interface RequestWithUser extends Request {
  user: {
    uuid: string;
  };
}

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create profile' })
  @ApiResponse({
    status: 201,
    description: 'The profile has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: RequestWithUser,
  ) {
    const imageUrl = image
      ? await this.uploadService.uploadFile(image)
      : BASE_IMAGE_URL;
    createProfileDto.image = imageUrl;
    createProfileDto.user_id = req.user.uuid;
    return this.profilesService.create(createProfileDto);
  }

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
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Param('profile_uuid') profileUuid: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    if (image) {
      updateProfileDto.image = await this.uploadService.uploadFile(image);
    }
    return this.profilesService.update(profileUuid, updateProfileDto);
  }

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
