import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Project, Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { technologies, ...projectData } = createProjectDto;

    try {
      return await this.prisma.project.create({
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Project with name ${projectData.name} already exists`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more technologies not found');
        }
      }
      throw error;
    }
  }

  async findAll(params: {
    search?: string;
    technology?: string;
    skip?: number;
    take?: number;
    orderBy?: 'name' | 'createdAt';
    order?: 'asc' | 'desc';
  }): Promise<{ projects: Project[]; total: number }> {
    const {
      search,
      technology,
      skip = 0,
      take = 10,
      orderBy = 'createdAt',
      order = 'desc'
    } = params;

    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (technology) {
      where.technologies = {
        some: {
          name: technology,
        },
      };
    }

    const validOrderFields = ['name', 'createdAt'];
    const validOrderTypes = ['asc', 'desc'];

    const sortField = validOrderFields.includes(orderBy) ? orderBy : 'createdAt';
    const sortOrder = validOrderTypes.includes(order) ? order : 'desc';

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          technologies: true,
        },
        skip,
        take,
        orderBy: {
          [sortField]: sortOrder,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        technologies: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const { technologies, ...projectData } = updateProjectDto;

    // Verificar si existe el proyecto
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          ...projectData,
          technologies: technologies ? {
            set: [], // Desvincula todas las tecnologías existentes
            connect: technologies.map(name => ({ name })), // Conecta las nuevas tecnologías
          } : undefined,
        },
        include: {
          technologies: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more technologies not found');
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Project> {
    // Verificar si existe el proyecto
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Eliminar el proyecto
    return await this.prisma.project.delete({
      where: { id },
      include: {
        technologies: true,
      },
    });
  }
}
