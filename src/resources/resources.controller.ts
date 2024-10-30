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
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FindResourcesDto } from './dto/find-resources.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('resources')
@Controller('resources')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'The resource has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all resources with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return all resources.' })
  findAll(
    @Query() findResourcesDto: FindResourcesDto,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ) {
    return this.resourcesService.findAll({
      ...findResourcesDto,
      skip,
      take,
    });
  }

  @Get('by-technology/:technologyId')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get resources by technology ID' })
  @ApiResponse({ status: 200, description: 'Return resources for the specified technology.' })
  findByTechnology(@Param('technologyId', ParseIntPipe) technologyId: number) {
    return this.resourcesService.findByTechnology(technologyId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a resource by id' })
  @ApiResponse({ status: 200, description: 'Return the resource.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a resource' })
  @ApiResponse({ status: 200, description: 'The resource has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiResponse({ status: 200, description: 'The resource has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }
}
