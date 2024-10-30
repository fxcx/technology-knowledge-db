import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FindQuestionsDto } from './dto/find-questions.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Question } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    // Verificar si existe la tecnología
    const technology = await this.prisma.technology.findUnique({
      where: { id: createQuestionDto.technologyId },
    });

    if (!technology) {
      throw new NotFoundException(
        `Technology with ID ${createQuestionDto.technologyId} not found`,
      );
    }

    return this.prisma.question.create({
      data: createQuestionDto,
      include: {
        technology: true,
      },
    });
  }

  async findAll(params: FindQuestionsDto): Promise<{ questions: Question[]; total: number }> {
    const {
      search,
      technologyId,
      skip = 0,
      take = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const where: Prisma.QuestionWhereInput = {};

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (technologyId) {
      where.technologyId = technologyId;
    }

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
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
      this.prisma.question.count({ where }),
    ]);

    return { questions, total };
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        technology: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async findByTechnology(technologyId: number): Promise<Question[]> {
    // Verificar si existe la tecnología
    const technology = await this.prisma.technology.findUnique({
      where: { id: technologyId },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with ID ${technologyId} not found`);
    }

    return this.prisma.question.findMany({
      where: { technologyId },
      include: {
        technology: true,
      },
    });
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    // Verificar si existe la pregunta
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Si se está actualizando la tecnología, verificar que exista
    if (updateQuestionDto.technologyId) {
      const technology = await this.prisma.technology.findUnique({
        where: { id: updateQuestionDto.technologyId },
      });

      if (!technology) {
        throw new NotFoundException(
          `Technology with ID ${updateQuestionDto.technologyId} not found`,
        );
      }
    }

    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
      include: {
        technology: true,
      },
    });
  }

  async remove(id: number): Promise<Question> {
    // Verificar si existe la pregunta
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.prisma.question.delete({
      where: { id },
      include: {
        technology: true,
      },
    });
  }
}
