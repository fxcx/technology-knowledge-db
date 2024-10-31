import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Technology, Prisma } from '@prisma/client';

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    const { projects, ...technologyData } = createTechnologyDto;

    // Verificar si ya existe una tecnología con el mismo nombre
    const existing = await this.prisma.technology.findUnique({
      where: { name: technologyData.name },
    });

    if (existing) {
      throw new ConflictException(`Technology with name ${technologyData.name} already exists`);
    }

    try {
      return await this.prisma.technology.create({
        data: {
          ...technologyData,
          projects: {
            connect: projects?.map(name => ({ name })) || [],
          },
        },
        include: {
          projects: true,
          questions: true,
          resources: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Technology with name ${technologyData.name} already exists`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more projects not found');
        }
      }
      throw error;
    }
  }

  async findAll(params: {
    tag?: string;
    search?: string;
    project?: string;
    skip?: number;
    take?: number;
    orderBy?: 'name' | 'createdAt';
    order?: 'asc' | 'desc';
  }): Promise<{ technologies: Technology[]; total: number }> {
    const { 
      tag, 
      search, 
      project, 
      skip = 0, 
      take = 10,
      orderBy = 'createdAt',
      order = 'desc'
    } = params;

    const where: Prisma.TechnologyWhereInput = {};

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (project) {
      where.projects = {
        some: {
          name: project,
        },
      };
    }
    const validOrderFields = ['name', 'createdAt'];
    const validOrderTypes = ['asc', 'desc'];

    const sortField = validOrderFields.includes(orderBy) ? orderBy : 'createdAt';
    const sortOrder = validOrderTypes.includes(order) ? order : 'desc';

    const [technologies, total] = await Promise.all([
      this.prisma.technology.findMany({
        where,
        include: {
          questions: true,
          resources: true,
          projects: true,
        },
        skip,
        take,
        orderBy: {
          [sortField]: sortOrder,
        },
      }),
      this.prisma.technology.count({ where }),
    ]);

    return { technologies, total };
  }

  async findOne(id: number): Promise<Technology> {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
      include: {
        questions: true,
        resources: true,
        projects: true,
      },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    return technology;
  }

  async update(id: number, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology> {
    const { projects, ...technologyData } = updateTechnologyDto;

    // Verificar si existe la tecnología
    const existing = await this.prisma.technology.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (technologyData.name) {
      const nameExists = await this.prisma.technology.findFirst({
        where: {
          name: technologyData.name,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictException(`Technology with name ${technologyData.name} already exists`);
      }
    }

    try {
      return await this.prisma.technology.update({
        where: { id },
        data: {
          ...technologyData,
          projects: projects ? {
            set: [], // Desvincula todos los proyectos existentes
            connect: projects.map(name => ({ name })), // Conecta los nuevos proyectos
          } : undefined,
        },
        include: {
          questions: true,
          resources: true,
          projects: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more projects not found');
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Technology> {
    // Verificar si existe la tecnología
    const existing = await this.prisma.technology.findUnique({
      where: { id },
      include: {
        questions: true,
        resources: true,
        projects: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    // Verificar si tiene relaciones y eliminarlas si es necesario
    if (existing.questions.length > 0 || existing.resources.length > 0) {
      // Eliminar primero las relaciones
      await this.prisma.$transaction([
        this.prisma.question.deleteMany({
          where: { technologyId: id },
        }),
        this.prisma.resource.deleteMany({
          where: { technologyId: id },
        }),
      ]);
    }

    // Eliminar la tecnología
    return await this.prisma.technology.delete({
      where: { id },
      include: {
        projects: true,
      },
    });
  }

  async findByTags(tags: string[]): Promise<Technology[]> {
    return this.prisma.technology.findMany({
      where: {
        tags: {
          hasEvery: tags,
        },
      },
      include: {
        projects: true,
        questions: true,
        resources: true,
      },
    });
  }

  async findByProject(projectName: string): Promise<Technology[]> {
    return this.prisma.technology.findMany({
      where: {
        projects: {
          some: {
            name: projectName,
          },
        },
      },
      include: {
        projects: true,
        questions: true,
        resources: true,
      },
    });
  }
}