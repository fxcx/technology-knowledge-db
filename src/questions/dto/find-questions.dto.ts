import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindQuestionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  technologyId?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  take?: number;

  @ApiProperty({ required: false, enum: ['question', 'createdAt'] })
  @IsOptional()
  @IsString()
  orderBy?: 'question' | 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}
