import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('inviteCodes')
export class InviteCodesController {
  constructor(private readonly inviteCodesService: InviteCodesService) {}

  @Post()
  @Public()
  create(@Body() createInviteCodeDto: CreateInviteCodeDto) {
    return this.inviteCodesService.createCode(createInviteCodeDto);
  }

  @Get(':inviteCode')
  @Public()
  findSpace(@Param('inviteCode') inviteCode: string) {
    return this.inviteCodesService.findSpace(inviteCode);
  }
}
