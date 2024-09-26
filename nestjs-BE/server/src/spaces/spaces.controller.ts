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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from '../upload/upload.service';
import { ProfileSpaceService } from '../profile-space/profile-space.service';
import { RequestWithUser } from '../utils/interface';
import { ProfilesService } from '../profiles/profiles.service';
import { ConfigService } from '@nestjs/config';

@Controller('v2/spaces')
@ApiTags('spaces')
export class SpacesControllerV2 {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly uploadService: UploadService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly profilesService: ProfilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Create space' })
  @ApiResponse({
    status: 201,
    description: 'The space has been successfully created.',
  })
  async create(
    @UploadedFile() icon: Express.Multer.File,
    @Body(new ValidationPipe({ whitelist: true, disableErrorMessages: true }))
    createSpaceDto: CreateSpaceDto,
    @Req() req: RequestWithUser,
  ) {
    const profile = await this.profilesService.findProfile(req.user.uuid);
    if (!profile) throw new NotFoundException();
    const iconUrl = icon
      ? await this.uploadService.uploadFile(icon)
      : this.configService.get<string>('APP_ICON_URL');
    createSpaceDto.icon = iconUrl;
    const space = await this.spacesService.createSpace(createSpaceDto);
    await this.profileSpaceService.joinSpace(profile.uuid, space.uuid);
    return { statusCode: 201, message: 'Created', data: space };
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
    description: 'Space not found.',
  })
  async findOne(
    @Param('space_uuid') spaceUuid: string,
    @Query('profile_uuid') profileUuid: string,
    @Req() req: RequestWithUser,
  ) {
    if (!profileUuid) throw new BadRequestException();
    const profile =
      await this.profilesService.findProfileByProfileUuid(profileUuid);
    if (!profile) throw new ForbiddenException();
    if (req.user.uuid != profile.userUuid) {
      throw new ForbiddenException();
    }
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    const profileSpace =
      await this.profileSpaceService.findProfileSpaceByBothUuid(
        profileUuid,
        spaceUuid,
      );
    if (!profileSpace) throw new ForbiddenException();
    return { statusCode: 200, message: 'OK', data: space };
  }

  @Patch(':space_uuid')
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Update space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Space has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  async update(
    @UploadedFile() icon: Express.Multer.File,
    @Param('space_uuid') spaceUuid: string,
    @Body(new ValidationPipe({ whitelist: true, disableErrorMessages: true }))
    updateSpaceDto: UpdateSpaceDto,
  ) {
    if (icon) {
      updateSpaceDto.icon = await this.uploadService.uploadFile(icon);
    }
    const space = await this.spacesService.updateSpace(
      spaceUuid,
      updateSpaceDto,
    );
    if (!space) throw new NotFoundException();
    return { statusCode: 200, message: 'Success', data: space };
  }
}

/*
  OLD VERSION
*/
@Controller('spaces')
@ApiTags('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly uploadService: UploadService,
    private readonly profileSpaceService: ProfileSpaceService,
    private readonly profilesService: ProfilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Create space' })
  @ApiResponse({
    status: 201,
    description: 'The space has been successfully created.',
  })
  async create(
    @UploadedFile() icon: Express.Multer.File,
    @Body(new ValidationPipe({ whitelist: true, disableErrorMessages: true }))
    createSpaceDto: CreateSpaceDto,
    @Req() req: RequestWithUser,
  ) {
    const profile = await this.profilesService.findProfile(req.user.uuid);
    if (!profile) throw new NotFoundException();
    const iconUrl = icon
      ? await this.uploadService.uploadFile(icon)
      : this.configService.get<string>('APP_ICON_URL');
    createSpaceDto.icon = iconUrl;
    const space = await this.spacesService.createSpace(createSpaceDto);
    await this.profileSpaceService.joinSpace(profile.uuid, space.uuid);
    return { statusCode: 201, message: 'Created', data: space };
  }

  @Get(':space_uuid')
  @ApiOperation({ summary: 'Get space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the space data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  async findOne(@Param('space_uuid') spaceUuid: string) {
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    return { statusCode: 200, message: 'Success', data: space };
  }

  @Patch(':space_uuid')
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Update space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Space has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  async update(
    @UploadedFile() icon: Express.Multer.File,
    @Param('space_uuid') spaceUuid: string,
    @Body(new ValidationPipe({ whitelist: true, disableErrorMessages: true }))
    updateSpaceDto: UpdateSpaceDto,
  ) {
    if (icon) {
      updateSpaceDto.icon = await this.uploadService.uploadFile(icon);
    }
    const space = await this.spacesService.updateSpace(
      spaceUuid,
      updateSpaceDto,
    );
    if (!space) throw new NotFoundException();
    return { statusCode: 200, message: 'Success', data: space };
  }
}
