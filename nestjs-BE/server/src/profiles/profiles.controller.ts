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
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
    status: HttpStatus.OK,
    description: 'Return the profile data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async findProfileByUserUuid(@Req() req: RequestWithUser) {
    const profile = await this.profilesService.findProfileByUserUuid(
      req.user.uuid,
    );
    if (!profile) throw new NotFoundException();
    return { statusCode: HttpStatus.OK, message: 'Success', data: profile };
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
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
    return { statusCode: HttpStatus.OK, message: 'Success', data: profile };
  }
}
