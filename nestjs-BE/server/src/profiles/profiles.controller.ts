import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Request as Req,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UploadService } from '../upload/upload.service';
import { RequestWithUser } from '../utils/interface';

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
  async findProfileByUserUuid(@Req() req: RequestWithUser) {
    const profile = await this.profilesService.findProfileByUserUuid(
      req.user.uuid,
    );
    if (!profile) throw new NotFoundException();
    return { statusCode: 200, message: 'Success', data: profile };
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
    @Body(new ValidationPipe({ whitelist: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    if (image) {
      updateProfileDto.image = await this.uploadService.uploadFile(image);
    }
    const profile = await this.profilesService.updateProfile(
      req.user.uuid,
      updateProfileDto,
    );
    if (!profile) throw new NotFoundException();
    return { statusCode: 200, message: 'Success', data: profile };
  }
}
