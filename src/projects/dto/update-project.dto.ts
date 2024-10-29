import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

// El PartialType() crea un DTO que hereda de CreateProjectDto pero los convierte en opcionales
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}