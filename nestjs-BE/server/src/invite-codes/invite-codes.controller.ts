import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpacesService } from 'src/spaces/spaces.service';

@Controller('inviteCodes')
@ApiTags('inviteCodes')
export class InviteCodesController {
  constructor(
    private readonly inviteCodesService: InviteCodesService,
    private readonly spacesService: SpacesService,
  ) {}

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
  async create(@Body() createInviteCodeDto: CreateInviteCodeDto) {
    const spaceUuid = createInviteCodeDto.space_uuid;
    const space = await this.spacesService.findSpace(spaceUuid);
    if (!space) throw new NotFoundException();
    const inviteCode =
      await this.inviteCodesService.createInviteCode(spaceUuid);
    return {
      statusCode: 201,
      message: 'Created',
      data: { invite_code: inviteCode.invite_code },
    };
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
  async findSpace(@Param('inviteCode') inviteCode: string) {
    const inviteCodeData =
      await this.inviteCodesService.findInviteCode(inviteCode);
    if (!inviteCodeData) throw new NotFoundException();
    if (this.inviteCodesService.checkExpiry(inviteCodeData.expiry_date)) {
      this.inviteCodesService.deleteInviteCode(inviteCode);
      throw new HttpException('Invite code has expired.', HttpStatus.GONE);
    }
    const space = await this.spacesService.findSpace(inviteCodeData.space_uuid);
    return { statusCode: 200, message: 'Success', data: space };
  }
}
