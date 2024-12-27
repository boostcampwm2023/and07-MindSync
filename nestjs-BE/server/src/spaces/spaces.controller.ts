import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UploadedFile,
  ValidationPipe,
  Header,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { IsProfileInSpaceGuard } from '../auth/guards/is-profile-in-space.guard';
import { MatchUserProfileGuard } from '../auth/guards/match-user-profile.guard';

@Controller('spaces')
@ApiTags('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @UseGuards(MatchUserProfileGuard)
  @ApiOperation({ summary: 'Create space' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The space has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile uuid needed. Space name needed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User doesn't logged in.",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Profile user doesn't have.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found.',
  })
  async createSpace(
    @UploadedFile() icon: Express.Multer.File,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        disableErrorMessages: true,
      }),
    )
    createSpaceDto: CreateSpaceDto,
  ) {
    const space = await this.spacesService.createSpace(icon, createSpaceDto);
    return { statusCode: HttpStatus.CREATED, message: 'Created', data: space };
  }

  @Get(':space_uuid')
  @UseGuards(MatchUserProfileGuard)
  @UseGuards(IsProfileInSpaceGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get space by space uuid' })
  @ApiQuery({
    name: 'profile_uuid',
    type: String,
    description: 'profile uuid',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the space data.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Query profile_uuid needed',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User doesn't logged in.",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Profile not joined space. Profile user doesn't have",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found. Profile not found',
  })
  async findSpace(@Param('space_uuid') spaceUuid: string) {
    const space = await this.spacesService.findSpace(spaceUuid);
    return { statusCode: HttpStatus.OK, message: 'OK', data: space };
  }

  @Patch(':space_uuid')
  @UseGuards(MatchUserProfileGuard)
  @UseGuards(IsProfileInSpaceGuard)
  @ApiOperation({ summary: 'Update space by space_uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Space has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile uuid needed. ',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not logged in.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Profile user doesn't have. Profile not joined space.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found.',
  })
  async updateSpace(
    @UploadedFile() icon: Express.Multer.File,
    @Param('space_uuid') spaceUuid: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        disableErrorMessages: true,
      }),
    )
    updateSpaceDto: UpdateSpaceDto,
  ) {
    const space = await this.spacesService.updateSpace(
      spaceUuid,
      icon,
      updateSpaceDto,
    );
    return { statusCode: HttpStatus.OK, message: 'OK', data: space };
  }

  @Post(':space_uuid/profiles/:profile_uuid')
  @UseGuards(MatchUserProfileGuard)
  @ApiOperation({ summary: 'Join space' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Join data has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile uuid needed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not logged in.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Profile user not own.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict. You have already joined the space.',
  })
  async joinSpace(
    @Param('space_uuid') spaceUuid: string,
    @Param('profile_uuid') profileUuid: string,
  ) {
    const space = await this.spacesService.joinSpace(profileUuid, spaceUuid);
    return { statusCode: HttpStatus.CREATED, message: 'Created', data: space };
  }

  @Delete(':space_uuid/profiles/:profile_uuid')
  @UseGuards(MatchUserProfileGuard)
  @UseGuards(IsProfileInSpaceGuard)
  @ApiOperation({ summary: 'Leave space' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully left the space.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not logged in.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Profile user not own.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found. Profile not joined space.',
  })
  async leaveSpace(
    @Param('space_uuid') spaceUuid: string,
    @Param('profile_uuid') profileUuid: string,
  ) {
    await this.spacesService.leaveSpace(profileUuid, spaceUuid);
    return { statusCode: HttpStatus.OK, message: 'OK' };
  }

  @Get(':space_uuid/profiles')
  @UseGuards(MatchUserProfileGuard)
  @UseGuards(IsProfileInSpaceGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get profiles joined space.' })
  @ApiQuery({
    name: 'profile_uuid',
    type: String,
    description: 'profile uuid',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully get profiles.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile uuid needed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not logged in.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Profile user not own. Profile not joined space.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found.',
  })
  async findProfilesInSpace(@Param('space_uuid') spaceUuid: string) {
    const profiles = await this.spacesService.findProfilesInSpace(spaceUuid);
    return { statusCode: HttpStatus.OK, message: 'OK', data: profiles };
  }
}
