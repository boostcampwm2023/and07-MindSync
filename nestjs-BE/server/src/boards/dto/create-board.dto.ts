import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: '보드 이름' })
  @IsString()
  @IsNotEmpty()
  boardName: string;

  @ApiProperty({ description: '스페이스 id' })
  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @ApiProperty({ format: 'binary', description: '이미지' })
  image: string;
}
