import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from 'src/config/magic-number';

export class CreateBoardDto {
  @ApiProperty({ description: '보드 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  boardName: string;

  @ApiProperty({ description: '스페이스 id' })
  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @ApiProperty({ format: 'binary', description: '이미지' })
  image: string;
}
