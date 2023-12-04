import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RestoreBoardDto {
  @ApiProperty({ description: '복구할 보드 id' })
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
