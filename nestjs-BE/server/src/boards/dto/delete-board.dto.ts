import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBoardDto {
  @ApiProperty({ description: '삭제할 보드 id' })
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
