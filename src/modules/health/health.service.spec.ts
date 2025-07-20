import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { CreateHealthDto } from './dto/create-health.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { Gender } from '../../common/enums/gender.enum';

const mockHealthRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockAuthService = {
  getOrError: jest.fn(),
};

describe('HealthService', () => {
  let service: HealthService;
  let healthRepo: Repository<Health>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: getRepositoryToken(Health),
          useFactory: mockHealthRepository,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    healthRepo = module.get<Repository<Health>>(getRepositoryToken(Health));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a health record', async () => {
      const dto: CreateHealthDto = {
        authId: 'auth123',
        dob: new Date('2000-01-01').toISOString(),
        gender: Gender['Not Specified'],
        phone: '1234567890',
        fullName: 'John Doe',
      };

      const mockAuth = { id: dto.authId };
      const savedHealth = {
        id: 'health123',
        ...dto,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockAuthService.getOrError.mockResolvedValue(mockAuth);
      healthRepo.save = jest.fn().mockResolvedValue(savedHealth);

      const result = await service.create(dto);

      expect(mockAuthService.getOrError).toHaveBeenCalledWith({
        filterConditions: { id: dto.authId },
      });
      expect(healthRepo.save).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        phone: dto.phone,
        dob: dto.dob,
        gender: dto.gender,
        authId: dto.authId,
      });
      expect(result).toEqual(savedHealth);
    });
  });

  describe('update', () => {
    it('should update specified fields of a health record', async () => {
      const updateDto: UpdateHealthDto = {
        firstName: 'Jane',
        phone: '0987654321',
      };

      const existingHealth = {
        id: 'health123',
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('2000-01-01'),
        gender: 'male',
        phone: '1234567890',
      };

      const updatedHealth = {
        ...existingHealth,
        ...updateDto,
      };

      // Use service's own getOrError method
      jest
        .spyOn(service as any, 'getOrError')
        .mockResolvedValue(existingHealth);
      healthRepo.save = jest.fn().mockResolvedValue(updatedHealth);

      const result = await service.update('health123', updateDto);

      expect(result).toEqual(updatedHealth);
      expect(healthRepo.save).toHaveBeenCalledWith({
        ...existingHealth,
        ...updateDto,
      });
    });
  });
});
