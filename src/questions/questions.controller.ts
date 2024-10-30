import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FindQuestionsDto } from './dto/find-questions.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('questions')
@Controller('questions')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'The question has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all questions with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return all questions.' })
  findAll(
    @Query() findQuestionsDto: FindQuestionsDto,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ) {
    return this.questionsService.findAll({
      ...findQuestionsDto,
      skip,
      take,
    });
  }

  @Get('by-technology/:technologyId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get questions by technology ID' })
  @ApiResponse({ status: 200, description: 'Return questions for the specified technology.' })
  findByTechnology(@Param('technologyId', ParseIntPipe) technologyId: number) {
    return this.questionsService.findByTechnology(technologyId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a question by id' })
  @ApiResponse({ status: 200, description: 'Return the question.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({ status: 200, description: 'The question has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 200, description: 'The question has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.remove(id);
  }
}
