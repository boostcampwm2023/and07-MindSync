import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBoardDto {
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
