import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardSuccess {
  @ApiProperty({ description: '생성한 보드 id' })
  boardId: string;

  @ApiProperty({ description: '보드를 생성한 UTC 시각' })
  date: Date;
}

export class BoardInSpace {
  @ApiProperty({ description: '보드 id' })
  boardId: string;

  @ApiProperty({ description: '보드 이름' })
  boardName: string;

  @ApiProperty({ description: '보드를 생성한 UTC 시각' })
  createdAt: Date;

  @ApiProperty({ description: '보드 이미지 url' })
  imageUrl: string;

  @ApiProperty({ description: '삭제 여부' })
  isDeleted: boolean;
}
