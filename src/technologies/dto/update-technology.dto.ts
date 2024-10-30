import { PartialType } from '@nestjs/mapped-types';
import { CreateTechnologyDto } from './create-technology.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTechnologyDto extends PartialType(CreateTechnologyDto) {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  tags?: string[];

  @ApiProperty({ required: false })
  projects?: string[];
}