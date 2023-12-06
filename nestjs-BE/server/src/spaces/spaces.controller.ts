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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from 'src/upload/upload.service';
import customEnv from 'src/config/env';
const { BASE_IMAGE_URL } = customEnv;

@Controller('spaces')
@ApiTags('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly uploadService: UploadService,
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
    @Body() createSpaceDto: CreateSpaceDto,
  ) {
    const iconUrl = icon
      ? await this.uploadService.uploadFile(icon)
      : BASE_IMAGE_URL;
    createSpaceDto.icon = iconUrl;
    return this.spacesService.create(createSpaceDto);
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
  findOne(@Param('space_uuid') spaceUuid: string) {
    return this.spacesService.findOne(spaceUuid);
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
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    if (icon) {
      updateSpaceDto.icon = await this.uploadService.uploadFile(icon);
    }
    return this.spacesService.update(spaceUuid, updateSpaceDto);
  }

  @Delete(':space_uuid')
  @ApiOperation({ summary: 'Remove space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Space has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  remove(@Param('space_uuid') spaceUuid: string) {
    return this.spacesService.remove(spaceUuid);
  }
}
