import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FindResourcesDto } from './dto/find-resources.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Resource } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    // Verificar si existe la tecnología
    const technology = await this.prisma.technology.findUnique({
      where: { id: createResourceDto.technologyId },
    });

    if (!technology) {
      throw new NotFoundException(
        `Technology with ID ${createResourceDto.technologyId} not found`,
      );
    }

    return this.prisma.resource.create({
      data: createResourceDto,
      include: {
        technology: true,
      },
    });
  }

  async findAll(params: FindResourcesDto): Promise<{ resources: Resource[]; total: number }> {
    const {
      search,
      technologyId,
      skip = 0,
      take = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const where: Prisma.ResourceWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (technologyId) {
      where.technologyId = technologyId;
    }

    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        include: {
          technology: true,
        },
        skip,
        take,
        orderBy: {
          [orderBy]: order,
        },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return { resources, total };
  }

  async findOne(id: number): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        technology: true,
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  async findByTechnology(technologyId: number): Promise<Resource[]> {
    // Verificar si existe la tecnología
    const technology = await this.prisma.technology.findUnique({
      where: { id: technologyId },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with ID ${technologyId} not found`);
    }

    return this.prisma.resource.findMany({
      where: { technologyId },
      include: {
        technology: true,
      },
    });
  }

  async update(id: number, updateResourceDto: UpdateResourceDto): Promise<Resource> {
    // Verificar si existe el recurso
    const existingResource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // Si se está actualizando la tecnología, verificar que exista
    if (updateResourceDto.technologyId) {
      const technology = await this.prisma.technology.findUnique({
        where: { id: updateResourceDto.technologyId },
      });

      if (!technology) {
        throw new NotFoundException(
          `Technology with ID ${updateResourceDto.technologyId} not found`,
        );
      }
    }

    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
      include: {
        technology: true,
      },
    });
  }

  async remove(id: number): Promise<Resource> {
    // Verificar si existe el recurso
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return this.prisma.resource.delete({
      where: { id },
      include: {
        technology: true,
      },
    });
  }
}