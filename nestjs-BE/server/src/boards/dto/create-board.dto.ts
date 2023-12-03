import { ApiProperty } from '@nestjs/swagger';
export class CreateBoardDto {
  @ApiProperty({
    example: { key1: 'value1', key2: 'value2' },
    description: 'JSON data as an object',
  })
  data: Record<string, string>;
}
