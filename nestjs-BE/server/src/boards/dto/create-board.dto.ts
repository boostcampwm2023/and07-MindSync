import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: '보드 이름' })
  @IsString()
  @IsNotEmpty()
  boardName: string;

  @ApiProperty({ description: '스페이스 id' })
  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @ApiProperty({ description: '이미지 url' })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;
}
