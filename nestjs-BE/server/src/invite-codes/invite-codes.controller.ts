import {
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { IsProfileInSpaceGuard } from '../auth/guards/is-profile-in-space.guard';
import { MatchUserProfileGuard } from '../profiles/guards/match-user-profile.guard';

@Controller('inviteCodes')
@ApiTags('inviteCodes')
export class InviteCodesController {
  constructor(private readonly inviteCodesService: InviteCodesService) {}

  @Post(':space_uuid')
  @UseGuards(MatchUserProfileGuard)
  @UseGuards(IsProfileInSpaceGuard)
  @ApiOperation({ summary: 'Create invite code' })
  @ApiBody({ type: CreateInviteCodeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The invite code has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Space code input is missing.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'need access token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found.',
  })
  async createInviteCode(@Param('space_uuid') spaceUuid: string) {
    const inviteCode =
      await this.inviteCodesService.createInviteCode(spaceUuid);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      data: { invite_code: inviteCode.inviteCode },
    };
  }

  @Get(':inviteCode')
  @ApiOperation({ summary: 'Find space by invite code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a space associated with the invite code.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'need access token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invite code not found.',
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Invite code has expired',
  })
  async findSpace(@Param('inviteCode') inviteCode: string) {
    const space = await this.inviteCodesService.findSpace(inviteCode);
    return { statusCode: HttpStatus.OK, message: 'Success', data: space };
  }
}
