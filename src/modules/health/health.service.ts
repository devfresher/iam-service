import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { UpdateHealthDto } from './dto/update-health.dto';
import { CreateHealthDto } from '../../modules/health/dto/create-health.dto';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class HealthService extends BaseService<Health> {
  constructor(
    @InjectRepository(Health)
    private readonly healthRepository: Repository<Health>,
    private readonly authService: AuthService,
  ) {
    super(healthRepository, 'Health');
  }

  async create(dto: CreateHealthDto) {
    const { dob, gender, phone, authId, fullName } = dto;
    const { firstName, lastName } = this.parseFullName(fullName);

    const auth = await this.authService.getOrError({
      filterConditions: { id: authId },
    });

    const health = await this.healthRepository.save({
      firstName,
      lastName,
      phone,
      dob,
      gender,
      authId: authId,
    });

    return health;
  }

  async update(id: string, updateHealthDto: UpdateHealthDto) {
    const { firstName, lastName, dob, gender, phone } = updateHealthDto;

    const health = await this.getOrError({
      filterConditions: { id },
    });

    if (firstName) health.firstName = firstName;
    if (lastName) health.lastName = lastName;
    if (dob) health.dob = new Date(dob);
    if (gender) health.gender = gender;
    if (phone) health.phone = phone;

    return await this.healthRepository.save(health);
  }

  private parseFullName(fullName: string) {
    const names = fullName.trim().split(' ');
    const firstName = names.shift();
    const lastName = names.join(' ') || '';
    return { firstName, lastName };
  }
}
