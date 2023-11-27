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

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  create(@Body() createSpaceDto: CreateSpaceDto) {
    return this.spacesService.create(createSpaceDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.spacesService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spacesService.update(uuid, updateSpaceDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.spacesService.remove(uuid);
  }
}
