import {
  Controller,
  Get,
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
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('profileSpace')
@ApiTags('profileSpace')
export class ProfileSpaceController {
  constructor(
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly spacesService: SpacesService,
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
    const userUuid = req.user.uuid;
    const { space_uuid } = createProfileSpaceDto;
    const { joinData, profileData } =
      await this.profileSpaceService.processData(userUuid, space_uuid);
    const responseData = await this.profileSpaceService.create(joinData);
    const data = await this.spacesService.processData(space_uuid, profileData);
    await this.profileSpaceService.put(userUuid, space_uuid, data);
    return responseData;
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
    const userUuid = req.user.uuid;
    const { joinData, profileData } =
      await this.profileSpaceService.processData(userUuid, spaceUuid);
    await this.spacesService.processData(spaceUuid, profileData);
    const isSpaceEmpty = await this.profileSpaceService.delete(
      userUuid,
      spaceUuid,
      profileData,
    );
    if (isSpaceEmpty) return this.spacesService.remove(spaceUuid);
    const key = this.profileSpaceService.generateKey(joinData);
    return this.profileSpaceService.remove(key);
  }

  @Get('spaces')
  @ApiOperation({ summary: 'Get user’s spaces' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of spaces.',
  })
  getSpaces(@Req() req: RequestWithUser) {
    const userUuid = req.user.uuid;
    return this.profileSpaceService.retrieveUserSpaces(userUuid);
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
  getUsers(@Param('space_uuid') spaceUuid: string) {
    return this.profileSpaceService.retrieveSpaceUsers(spaceUuid);
  }
}
