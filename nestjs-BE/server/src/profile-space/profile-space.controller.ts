import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Request as Req,
  NotFoundException,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { ProfileSpaceService } from './profile-space.service';
import { CreateProfileSpaceDto } from './dto/create-profile-space.dto';
import { RequestWithUser } from 'src/utils/interface';
import { SpacesService } from 'src/spaces/spaces.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from 'src/profiles/profiles.service';

@Controller('profileSpace')
@ApiTags('profileSpace')
export class ProfileSpaceController {
  constructor(
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly spacesService: SpacesService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post('join')
  @ApiOperation({ summary: 'Join space' })
  @ApiResponse({
    status: 201,
    description: 'Join data has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. You have already joined the space.',
  })
  async create(
    @Body() createProfileSpaceDto: CreateProfileSpaceDto,
    @Req() req: RequestWithUser,
  ) {
    const profile = await this.profilesService.findProfile(req.user.uuid);
    if (!profile) throw new NotFoundException();
    const profileSpace = await this.profileSpaceService.joinSpace(
      profile.uuid,
      createProfileSpaceDto.space_uuid,
    );
    if (!profileSpace) {
      throw new HttpException('Data already exists.', HttpStatus.CONFLICT);
    }
    return { statusCode: 201, message: 'Created', data: profileSpace };
  }

  @Delete('leave/:space_uuid')
  @ApiResponse({
    status: 204,
    description: 'Successfully left the space.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  async delete(
    @Param('space_uuid') spaceUuid: string,
    @Req() req: RequestWithUser,
  ) {
    const profile = await this.profilesService.findProfile(req.user.uuid);
    if (!profile) throw new NotFoundException();
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    const profileSpace = await this.profileSpaceService.leaveSpace(
      profile.uuid,
      spaceUuid,
    );
    if (!profileSpace) throw new ConflictException();
    const isSpaceEmpty = await this.profileSpaceService.isSpaceEmpty(spaceUuid);
    if (isSpaceEmpty) {
      await this.spacesService.deleteSpace(spaceUuid);
    }
    return { statusCode: 204, message: 'No Content' };
  }

  @Get('spaces')
  @ApiOperation({ summary: "Get user's spaces" })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of spaces.',
  })
  async getSpaces(@Req() req: RequestWithUser) {
    const profile = await this.profilesService.findProfile(req.user.uuid);
    if (!profile) throw new NotFoundException();
    const profileSpaces =
      await this.profileSpaceService.findProfileSpacesByProfileUuid(
        profile.uuid,
      );
    const spaceUuids = profileSpaces.map(
      (profileSpace) => profileSpace.space_uuid,
    );
    const spaces = await this.spacesService.findSpaces(spaceUuids);
    return { statusCode: 200, message: 'Success', data: spaces };
  }

  @Get('users/:space_uuid')
  @ApiOperation({ summary: 'Get users in the space' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of users.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  async getProfiles(@Param('space_uuid') spaceUuid: string) {
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    const profileSpaces =
      await this.profileSpaceService.findProfileSpacesBySpaceUuid(space.uuid);
    const profileUuids = profileSpaces.map(
      (profileSpace) => profileSpace.profile_uuid,
    );
    const profiles = await this.profilesService.findProfiles(profileUuids);
    return { statusCode: 200, message: 'Success', data: profiles };
  }
}
