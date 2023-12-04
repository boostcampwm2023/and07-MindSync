import { IsNotEmpty, IsString } from 'class-validator';

export class RestoreBoardDto {
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
