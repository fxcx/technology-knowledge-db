import { Injectable } from '@nestjs/common';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Technology, Prisma } from '@prisma/client';

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    const { projects, ...technologyData } = createTechnologyDto;

    return this.prisma.technology.create({
      data: {
        ...technologyData,
        projects: {
          // conecta los proyectos que se han pasado como parámetro
          connect: projects.map(name => ({ name })),
        },
      },
      include: {
        projects: true,
      },
    });
  }

  async findAll(params: {
    tag?: string;
    search?: string;
    project?: string;
  }): Promise<Technology[]> {
    const { tag, search, project } = params;
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
      ];
    }

    if (project) {
      where.projects = {
        some: {
          name: project,
        },
      };
    }

    return this.prisma.technology.findMany({
      where,
      include: {
        questions: true,
        resources: true,
        projects: true,
      },
    });
  }


  findOne(id: number) {
    return `This action returns a #${id} technology`;
  }

  update(id: number, updateTechnologyDto: UpdateTechnologyDto) {
    return `This action updates a #${id} technology`;
  }

  remove(id: number) {
    return `This action removes a #${id} technology`;
  }
}
