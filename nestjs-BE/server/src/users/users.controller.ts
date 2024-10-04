import { Controller, Get, HttpStatus, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RequestWithUser } from '../utils/interface';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('spaces')
  @ApiOperation({ summary: 'Get spaces user joined.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Spaces found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not logged in.',
  })
  async findUserJoinedSpaces(@Req() req: RequestWithUser) {
    const spaces = await this.usersService.findUserJoinedSpaces(req.user.uuid);

    return { statusCode: HttpStatus.OK, message: 'OK', data: spaces };
  }
}
