import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('inviteCodes')
@ApiTags('inviteCodes')
export class InviteCodesController {
  constructor(private readonly inviteCodesService: InviteCodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create invite code' })
  @ApiResponse({
    status: 201,
    description: 'The invite code has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Space code input is missing.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  create(@Body() createInviteCodeDto: CreateInviteCodeDto) {
    return this.inviteCodesService.createCode(createInviteCodeDto);
  }

  @Get(':inviteCode')
  @ApiOperation({ summary: 'Find space by invite code' })
  @ApiResponse({
    status: 200,
    description: 'Returns a space associated with the invite code.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invite code not found.',
  })
  @ApiResponse({
    status: 410,
    description: 'Invite code has expired',
  })
  findSpace(@Param('inviteCode') inviteCode: string) {
    return this.inviteCodesService.findSpace(inviteCode);
  }
}
