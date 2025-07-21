import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { BaseService } from 'src/common/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthService } from '../health/health.service';
import { ActiveUser } from '../auth/types/active-user';
import { Role } from 'src/common/enums/role.enum';
import { parseTimeString } from 'src/common/utils/date-time.util';

@Injectable()
export class AppointmentService extends BaseService<Appointment> {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly healthService: HealthService,
  ) {
    super(appointmentRepository, 'Appointment');
  }
  async create(user: ActiveUser, createAppointmentDto: CreateAppointmentDto) {
    const {
      date: dateString,
      description,
      healthId,
      time,
      title,
    } = createAppointmentDto;

    const dateTime = new Date(dateString);
    if (isNaN(dateTime.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const [hour, minute, second] = parseTimeString(time);
    dateTime.setHours(hour, minute, second, 0);

    if (dateTime < new Date()) {
      throw new BadRequestException('Appointment time cannot be in the past');
    }

    // Check for existing appointments at the same time
    const existingAppointment = await this.appointmentRepository.findOne({
      where: { appointmentAt: dateTime, healthId },
    });
    if (existingAppointment) {
      throw new BadRequestException(
        'An appointment already exists at this time',
      );
    }

    // 5hrs before the appointment time
    const fiveHoursBefore = new Date(dateTime.getTime() - 5 * 60 * 60 * 1000);
    if (fiveHoursBefore < new Date()) {
      throw new BadRequestException(
        'Appointments must be scheduled at least 5 hours in advance',
      );
    }

    // Validate healthId
    const health = await this.healthService.getOrError({
      filterConditions: { id: healthId },
    });

    // Ensure the health belongs to the authenticated user or is an admin
    if (health.authId !== user.id && !user.roles.includes(Role.Admin)) {
      throw new ForbiddenException(
        'You do not have permission to create this appointment',
      );
    }

    // Create the appointment
    const appointment = this.appointmentRepository.create({
      appointmentAt: dateTime,
      description,
      healthId: health.id,
      title,
    });

    return await this.appointmentRepository.save(appointment);
  }
}
