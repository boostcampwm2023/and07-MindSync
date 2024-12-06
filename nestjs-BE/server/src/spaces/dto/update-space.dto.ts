import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/constants';

export class UpdateSpaceRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name: string;

  @IsOptional()
  @ApiProperty({
    example: 'new image',
    description: 'Updated space icon',
    required: false,
  })
  icon: string;
}

export class UpdateSpacePrismaDto {
  name: string;
  icon: string;
}
