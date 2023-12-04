import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  boardName: string;

  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;
}
