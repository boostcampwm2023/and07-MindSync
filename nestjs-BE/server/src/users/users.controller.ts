import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'User with the provided email already exists.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Get(':email')
  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({
    status: 200,
    description: 'Return the user data.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiOperation({ summary: 'Get user' })
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Public()
  @Patch(':email')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(email, updateUserDto);
  }

  @Public()
  @Delete(':email')
  @ApiOperation({ summary: 'Remove user' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  remove(@Param('email') email: string) {
    return this.usersService.remove(email);
  }

  @Public()
  @Get('profiles/:email')
  @ApiOperation({ summary: 'Find profiles for a user' })
  @ApiResponse({
    status: 200,
    description: 'Return the list of profiles for the user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  findProfiles(@Param('email') email: string) {
    return this.usersService.findProfiles(email);
  }

  @Public()
  @Get('rooms/:email')
  @ApiOperation({ summary: 'Find rooms for a user' })
  @ApiResponse({
    status: 200,
    description: 'Return the list of rooms for the user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  findRooms(@Param('email') email: string) {
    return this.usersService.findRooms(email);
  }
}
