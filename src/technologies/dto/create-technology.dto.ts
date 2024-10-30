import { IsString, IsArray, IsNotEmpty, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnologyDto {
  @ApiProperty({
    description: 'The name of the technology',
    example: 'React',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'A detailed description of the technology',
    example: 'A JavaScript library for building user interfaces',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Tags associated with the technology',
    example: ['frontend', 'javascript', 'ui'],
    type: [String],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  tags: string[];

  @ApiProperty({
    description: 'Projects that use this technology',
    example: ['web-app', 'mobile-app'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  projects?: string[];
}