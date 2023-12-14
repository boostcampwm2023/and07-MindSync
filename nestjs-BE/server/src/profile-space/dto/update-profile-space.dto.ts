import { PartialType } from '@nestjs/swagger';
import { CreateProfileSpaceDto } from './create-profile-space.dto';

export class UpdateProfileSpaceDto extends PartialType(CreateProfileSpaceDto) {
  uuid?: string;
}
