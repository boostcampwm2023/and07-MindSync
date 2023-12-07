import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class CreatedBoard {
  @ApiProperty({ description: '생성한 보드 id' })
  boardId: string;

  @ApiProperty({ description: '보드를 생성한 UTC 시각' })
  date: Date;
}

export class CreateBoardSuccess {
  @ApiProperty({ example: HttpStatus.CREATED, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({ example: 'Board created', description: '응답 메세지' })
  message: string;

  @ApiProperty({ description: '데이터' })
  data: CreatedBoard;
}

export class CreateBoardFailure {
  @ApiProperty({ example: HttpStatus.CONFLICT, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({ example: 'Board already exist.', description: '응답 메세지' })
  message: string;

  @ApiProperty({ example: 'Conflict', description: '응답 메세지' })
  error: string;
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

export class BoardListSuccess {
  @ApiProperty({ example: HttpStatus.OK, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({ example: 'Retrieved board list.', description: '응답 메세지' })
  message: string;

  @ApiProperty({ isArray: true, description: '데이터' })
  data: BoardInSpace;
}

export class DeleteBoardSuccess {
  @ApiProperty({ example: HttpStatus.OK, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({ example: 'Board deleted.', description: '응답 메세지' })
  message: string;
}

export class DeleteBoardFailure {
  @ApiProperty({ example: HttpStatus.NOT_FOUND, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({
    example: 'Target board not found.',
    description: '응답 메세지',
  })
  message: string;

  @ApiProperty({ example: 'Not Found', description: '응답 메세지' })
  error: string;
}

export class RestoreBoardSuccess {
  @ApiProperty({ example: HttpStatus.OK, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({ example: 'Board restored.', description: '응답 메세지' })
  message: string;
}

export class RestoreBoardFailure {
  @ApiProperty({ example: HttpStatus.NOT_FOUND, description: '응답 코드' })
  statusCode: number;

  @ApiProperty({
    example: 'Target board not found.',
    description: '응답 메세지',
  })
  message: string;

  @ApiProperty({ example: 'Not Found', description: '응답 메세지' })
  error: string;
}
