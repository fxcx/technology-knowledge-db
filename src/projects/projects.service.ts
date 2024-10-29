import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createProjectDto: CreateProjectDto) {
    const { technologies, ...projectData } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...projectData,
        technologies: {
          connect: technologies.map(name => ({ name })),
        },
      },
      include: {
        technologies: true,
      },
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        technologies: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        technologies: true,
      },
    });
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    const { technologies, ...projectData } = updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        technologies: technologies ? {
          set: [], // desvincular todos los datos de la relación
          connect: technologies.map(name => ({ name })),
        } : undefined,
      },
      include: {
        technologies: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
