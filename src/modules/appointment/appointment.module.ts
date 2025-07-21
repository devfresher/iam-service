import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Health } from '../health/entities/health.entity';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Health]), HealthModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
