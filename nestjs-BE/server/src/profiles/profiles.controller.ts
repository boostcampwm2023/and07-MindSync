import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../auth/decorators/user.decorator';
import { MatchUserProfileGuard } from './guards/match-user-profile.guard';

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
  async findProfileByUserUuid(@User('uuid') userUuid: string) {
    const profile = await this.profilesService.findProfileByUserUuid(userUuid);
    return { statusCode: HttpStatus.OK, message: 'Success', data: profile };
  }

  @Patch(':profile_uuid')
  @UseGuards(MatchUserProfileGuard)
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Inappropriate profile uuid requested.',
  })
  async updateProfile(
    @UploadedFile() image: Express.Multer.File,
    @Param('profile_uuid') profileUuid: string,
    @Body(new ValidationPipe({ whitelist: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.profilesService.updateProfile(
      profileUuid,
      image,
      updateProfileDto,
    );
    return { statusCode: HttpStatus.OK, message: 'Success', data: profile };
  }
}
