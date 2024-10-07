import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Request as Req,
  NotFoundException,
  ValidationPipe,
  Header,
  HttpStatus,
  ForbiddenException,
  Query,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpacesService } from './spaces.service';
import { CreateSpaceRequestDto } from './dto/create-space.dto';
import { UpdateSpaceRequestDto } from './dto/update-space.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from '../upload/upload.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { RequestWithUser } from '../utils/interface';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JoinSpaceRequestDto } from './dto/join-space.dto';

@Controller('spaces')
@ApiTags('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly uploadService: UploadService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
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
  async create(
    @UploadedFile() icon: Express.Multer.File,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        disableErrorMessages: true,
      }),
    )
    createSpaceDto: CreateSpaceRequestDto,
    @Req() req: RequestWithUser,
  ) {
    if (!createSpaceDto.profileUuid) throw new BadRequestException();
    await this.usersService.verifyUserProfile(
      req.user.uuid,
      createSpaceDto.profileUuid,
    );
    const iconUrl = icon
      ? await this.uploadService.uploadFile(icon)
      : this.configService.get<string>('APP_ICON_URL');
    createSpaceDto.icon = iconUrl;
    const space = await this.spacesService.createSpace(createSpaceDto);
    await this.profileSpaceService.joinSpace(
      createSpaceDto.profileUuid,
      space.uuid,
    );
    return { statusCode: HttpStatus.CREATED, message: 'Created', data: space };
  }

  @Get(':space_uuid')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get space by space uuid' })
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
  async findOne(
    @Param('space_uuid') spaceUuid: string,
    @Query('profile_uuid') profileUuid: string,
    @Req() req: RequestWithUser,
  ) {
    if (!profileUuid) throw new BadRequestException();
    await this.usersService.verifyUserProfile(req.user.uuid, profileUuid);
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    const profileSpace =
      await this.profileSpaceService.findProfileSpaceByBothUuid(
        profileUuid,
        spaceUuid,
      );
    if (!profileSpace) throw new ForbiddenException();
    return { statusCode: HttpStatus.OK, message: 'OK', data: space };
  }

  @Patch(':space_uuid')
  @UseInterceptors(FileInterceptor('icon'))
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
  async update(
    @UploadedFile() icon: Express.Multer.File,
    @Param('space_uuid') spaceUuid: string,
    @Query('profile_uuid') profileUuid: string,
    @Body(new ValidationPipe({ whitelist: true, disableErrorMessages: true }))
    updateSpaceDto: UpdateSpaceRequestDto,
    @Req() req: RequestWithUser,
  ) {
    if (!profileUuid) throw new BadRequestException();
    await this.usersService.verifyUserProfile(req.user.uuid, profileUuid);
    const profileSpace =
      await this.profileSpaceService.findProfileSpaceByBothUuid(
        profileUuid,
        spaceUuid,
      );
    if (!profileSpace) throw new ForbiddenException();
    if (icon) {
      updateSpaceDto.icon = await this.uploadService.uploadFile(icon);
    }
    const space = await this.spacesService.updateSpace(
      spaceUuid,
      updateSpaceDto,
    );
    if (!space) throw new NotFoundException();
    return { statusCode: HttpStatus.OK, message: 'OK', data: space };
  }

  @Post(':space_uuid/join')
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
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        disableErrorMessages: true,
      }),
    )
    joinSpaceDto: JoinSpaceRequestDto,
    @Req() req: RequestWithUser,
  ) {
    const space = await this.spacesService.joinSpace(
      req.user.uuid,
      joinSpaceDto.profileUuid,
      spaceUuid,
    );
    return { statusCode: HttpStatus.CREATED, message: 'Created', data: space };
  }

  @Delete(':space_uuid/profiles/:profile_uuid')
  @ApiOperation({ summary: 'Leave space' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
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
    @Req() req: RequestWithUser,
  ) {
    await this.spacesService.leaveSpace(req.user.uuid, profileUuid, spaceUuid);
    return { statusCode: HttpStatus.OK, message: 'OK' };
  }

  @Get(':space_uuid/profiles')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get profiles joined space.' })
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
    description: 'Profile user not own.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found. Profile not joined space.',
  })
  async findProfilesInSpace(
    @Param('space_uuid') spaceUuid: string,
    @Query('profile_uuid') profileUuid: string,
    @Req() req: RequestWithUser,
  ) {
    if (!profileUuid) throw new BadRequestException();
    const profiles = await this.spacesService.findProfilesInSpace(
      req.user.uuid,
      profileUuid,
      spaceUuid,
    );
    return { statusCode: HttpStatus.OK, message: 'OK', data: profiles };
  }
}
