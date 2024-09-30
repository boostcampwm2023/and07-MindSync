import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_NAME_LENGTH } from '../../config/magic-number';

export class UpdateSpaceRequestV2Dto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name: string;

  @ApiProperty({
    example: 'new image',
    description: 'Updated space icon',
    required: false,
  })
  icon: string;
}

export class UpdateSpaceRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  @ApiProperty({
    example: 'new space',
    description: 'Updated space name',
    required: false,
  })
  name: string;

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
