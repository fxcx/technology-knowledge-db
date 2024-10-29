import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createResourceDto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: createResourceDto,
      include: {
        technology: true,
      },
    });
  }

  findAll() {
    return this.prisma.resource.findMany({
      include: {
        technology: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: {
        technology: true,
      },
    });
  }

  update(id: number, updateResourceDto: UpdateResourceDto) {
    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
      include: {
        technology: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}
