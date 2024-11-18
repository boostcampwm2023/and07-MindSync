import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';

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
  async findUserJoinedSpaces(@User('uuid') userUuid: string) {
    const spaces = await this.usersService.findUserJoinedSpaces(userUuid);

    return { statusCode: HttpStatus.OK, message: 'OK', data: spaces };
  }
}
