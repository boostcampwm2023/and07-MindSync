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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InviteCodesService } from './invite-codes.service';
import { CreateInviteCodeDto } from './dto/create-invite-code.dto';
import { SpacesService } from '../spaces/spaces.service';

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
  async create(@Body() createInviteCodeDto: CreateInviteCodeDto) {
    const spaceUuid = createInviteCodeDto.space_uuid;
    const space = await this.spacesService.findSpaceBySpaceUuid(spaceUuid);
    if (!space) throw new NotFoundException();
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
    status: HttpStatus.NOT_FOUND,
    description: 'Invite code not found.',
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Invite code has expired',
  })
  async findSpace(@Param('inviteCode') inviteCode: string) {
    const inviteCodeData =
      await this.inviteCodesService.findInviteCode(inviteCode);
    if (!inviteCodeData) throw new NotFoundException();
    if (this.inviteCodesService.checkExpiry(inviteCodeData.expiryDate)) {
      this.inviteCodesService.deleteInviteCode(inviteCode);
      throw new HttpException('Invite code has expired.', HttpStatus.GONE);
    }
    const space = await this.spacesService.findSpaceBySpaceUuid(
      inviteCodeData.spaceUuid,
    );
    return { statusCode: HttpStatus.OK, message: 'Success', data: space };
  }
}
