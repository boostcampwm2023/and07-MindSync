import { PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  uuid?: string;

  @ApiProperty({
    example: { key1: 'value1', key2: 'value2' },
    description: 'JSON data as an object for updating the board',
  })
  data: Record<string, string>;
}
