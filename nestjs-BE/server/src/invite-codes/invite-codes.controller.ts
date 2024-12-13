import { Controller, Get, Post, Body, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller('inviteCodes')
@ApiTags('inviteCodes')
export class InviteCodesController {
  constructor(private readonly inviteCodesService: InviteCodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create invite code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The invite code has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Space code input is missing.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Space not found.',
  })
  async createInviteCode(
    @Body() createInviteCodeDto: CreateInviteCodeDto,
    @User('uuid') userUuid: string,
  ) {
    const inviteCode = await this.inviteCodesService.createInviteCode(
      userUuid,
      createInviteCodeDto.profileUuid,
      createInviteCodeDto.spaceUuid,
    );
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
