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
  ParseArrayPipe,
} from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FindTechnologiesDto } from './dto/find-technologies.dto';

@ApiTags('technologies')
@Controller('technologies')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new technology' })
  @ApiResponse({ status: 201, description: 'The technology has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Technology already exists.' })
  create(@Body() createTechnologyDto: CreateTechnologyDto) {
    return this.technologiesService.create(createTechnologyDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all technologies' })
  @ApiResponse({ status: 200, description: 'Return all technologies.' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'project', required: false, description: 'Filter by project name' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of items to skip', type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, description: 'Number of items to take', type: Number, example: 10 })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to order by', enum: ['name', 'createdAt'] })
  @ApiQuery({ name: 'order', required: false, description: 'Order direction', enum: ['asc', 'desc'] })
  findAll(@Query() params: FindTechnologiesDto) {
    return this.technologiesService.findAll(params);
  }

  @Get('by-tags')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get technologies by tags' })
  findByTags(@Query('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[]) {
    return this.technologiesService.findByTags(tags);
  }

  @Get('by-project/:projectName')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get technologies by project' })
  findByProject(@Param('projectName') projectName: string) {
    return this.technologiesService.findByProject(projectName);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a technology by id' })
  @ApiResponse({ status: 200, description: 'Return the technology.' })
  @ApiResponse({ status: 404, description: 'Technology not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.technologiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a technology' })
  @ApiResponse({ status: 200, description: 'The technology has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Technology not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTechnologyDto: UpdateTechnologyDto) {
    return this.technologiesService.update(id, updateTechnologyDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a technology' })
  @ApiResponse({ status: 200, description: 'The technology has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Technology not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.technologiesService.remove(id);
  }
}