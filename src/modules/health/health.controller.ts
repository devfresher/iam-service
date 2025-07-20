import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { SortOrder } from 'src/common/interfaces/find-all-option.interface';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateHealthDto } from './dto/update-health.dto.js';
import { CreateHealthDto } from './dto/create-health.dto.js';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.decorator';
import { ActiveUser } from 'src/modules/auth/types/active-user';

@Controller('/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Healths retrieved successfully')
  @Get('/')
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    return await this.healthService.getAll({
      pageOpts: { page: +page, limit: +limit, search },
      relations: ['auth'],
      searchableFields: ['firstName', 'lastName', 'phone'],
      sortBy,
      sortOrder,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Healths retrieved successfully')
  @Get('/mine')
  async getMine(
    @AuthenticatedUser() user: ActiveUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    return await this.healthService.getAll({
      pageOpts: { page: +page, limit: +limit, search },
      filterConditions: { authId: user.id },
      relations: ['auth'],
      searchableFields: ['firstName', 'lastName', 'phone'],
      sortBy,
      sortOrder,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Health retrieved successfully')
  @Get('/mine/:id')
  async getMineById(
    @AuthenticatedUser() user: ActiveUser,
    @Param('id') id: string,
  ) {
    return await this.healthService.getOrError({
      filterConditions: { authId: user.id, id },
      relations: ['auth'],
    });
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Health retrieved successfully')
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.healthService.getOrError({
      filterConditions: { id },
      relations: ['auth'],
    });
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Health deleted successfully')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.healthService.deleteOrError({
      filterConditions: { id },
    });
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Health updated successfully')
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateHealthDto: UpdateHealthDto,
  ) {
    return await this.healthService.update(id, updateHealthDto);
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Health created successfully')
  @Post('/')
  async create(@Body() createHealthDto: CreateHealthDto) {
    return await this.healthService.create(createHealthDto);
  }
}
