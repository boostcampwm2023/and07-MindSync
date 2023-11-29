import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('spaces')
@ApiTags('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create space' })
  @ApiResponse({
    status: 201,
    description: 'The space has been successfully created.',
  })
  create(@Body() createSpaceDto: CreateSpaceDto) {
    return this.spacesService.create(createSpaceDto);
  }

  @Get(':space_uuid')
  @ApiOperation({ summary: 'Get space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the space data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  findOne(@Param('space_uuid') spaceUuid: string) {
    return this.spacesService.findOne(spaceUuid);
  }

  @Patch(':space_uuid')
  @ApiOperation({ summary: 'Update space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Space has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  update(
    @Param('space_uuid') spaceUuid: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(spaceUuid, updateSpaceDto);
  }

  @Delete(':space_uuid')
  @ApiOperation({ summary: 'Remove space by space_uuid' })
  @ApiResponse({
    status: 200,
    description: 'Space has been successfully removed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Space not found.',
  })
  remove(@Param('space_uuid') spaceUuid: string) {
    return this.spacesService.remove(spaceUuid);
  }
}
