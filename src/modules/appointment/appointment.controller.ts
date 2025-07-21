import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.decorator';
import { ActiveUser } from '../auth/types/active-user';
import { SortOrder } from 'src/common/interfaces/find-all-option.interface';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Appointment created successfully')
  @Post('/')
  create(
    @AuthenticatedUser() user: ActiveUser,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(user, createAppointmentDto);
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Appointments retrieved successfully')
  @Get('/')
  getAll(
    @AuthenticatedUser() user: ActiveUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    return this.appointmentService.getAll({
      pageOpts: { page: +page, limit: +limit, search },
      relations: ['health'],
      searchableFields: ['title', 'description', 'appointmentAt'],
      sortBy,
      sortOrder,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('My appointments retrieved successfully')
  @Get('/mine')
  getMine(
    @AuthenticatedUser() user: ActiveUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    return this.appointmentService.getAll({
      pageOpts: { page: +page, limit: +limit, search },
      filterConditions: { health: { authId: user.id } },
      relations: ['health'],
      searchableFields: ['title', 'description', 'appointmentAt'],
      sortBy,
      sortOrder,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Appointment retrieved successfully')
  @Get('/mine/:id')
  getMineById(@AuthenticatedUser() user: ActiveUser, @Param('id') id: string) {
    return this.appointmentService.getOrError({
      filterConditions: { health: { authId: user.id }, id },
      relations: ['health'],
    });
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Appointment retrieved successfully')
  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.appointmentService.getOrError({
      filterConditions: { id },
      relations: ['health'],
    });
  }
}
