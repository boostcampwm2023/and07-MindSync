import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Request as Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from 'src/upload/upload.service';
import { Request } from 'express';

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

  @Get()
  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse({
    status: 200,
    description: 'Return the profile data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  findOne(@Req() req: RequestWithUser) {
    return this.profilesService.findOne(req.user.uuid);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been successfully updated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    if (image) {
      updateProfileDto.image = await this.uploadService.uploadFile(image);
    }
    return this.profilesService.update(req.user.uuid, updateProfileDto);
  }
}
