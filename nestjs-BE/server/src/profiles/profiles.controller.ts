import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Request as Req,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestWithUser } from '../utils/interface';

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
  async updateProfile(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: RequestWithUser,
    @Body(new ValidationPipe({ whitelist: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.profilesService.updateProfile(
      req.user.uuid,
      updateProfileDto.uuid,
      image,
      updateProfileDto,
    );
    return { statusCode: HttpStatus.OK, message: 'Success', data: profile };
  }
}
