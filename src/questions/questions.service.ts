import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createQuestionDto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: createQuestionDto,
      include: {
        technology: true,
      },
    });
  }

  findAll() {
    return this.prisma.question.findMany({
      include: {
        technology: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        technology: true,
      },
    });
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
      include: {
        technology: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
