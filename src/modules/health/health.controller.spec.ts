import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Role } from '../../common/enums/role.enum';
import { UpdateHealthDto } from './dto/update-health.dto';
import { CreateHealthDto } from './dto/create-health.dto';
import { ActiveUser } from '../../modules/auth/types/active-user';
import { Gender } from '../../common/enums/gender.enum';

const mockHealthService = {
  getAll: jest.fn(),
  getOrError: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteOrError: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockUser: ActiveUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    roles: [Role.Patient],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call service.getAll with proper options', async () => {
      const result = ['item1', 'item2'];
      mockHealthService.getAll.mockResolvedValue(result);

      const response = await controller.getAll(
        1,
        10,
        'john',
        'createdAt',
        'DESC',
      );
      expect(service.getAll).toHaveBeenCalledWith({
        pageOpts: { page: 1, limit: 10, search: 'john' },
        relations: ['auth'],
        searchableFields: ['firstName', 'lastName', 'phone'],
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      expect(response).toEqual(result);
    });
  });

  describe('getMine', () => {
    it('should fetch records of the logged-in user', async () => {
      const data = ['mine1', 'mine2'];
      mockHealthService.getAll.mockResolvedValue(data);

      const response = await controller.getMine(
        mockUser,
        1,
        10,
        '',
        'createdAt',
        'ASC',
      );
      expect(service.getAll).toHaveBeenCalledWith({
        pageOpts: { page: 1, limit: 10, search: '' },
        filterConditions: { authId: mockUser.id },
        relations: ['auth'],
        searchableFields: ['firstName', 'lastName', 'phone'],
        sortBy: 'createdAt',
        sortOrder: 'ASC',
      });
      expect(response).toEqual(data);
    });
  });

  describe('getMineById', () => {
    it('should call service.getOrError with authId and id', async () => {
      const record = { id: '1', firstName: 'John' };
      mockHealthService.getOrError.mockResolvedValue(record);

      const result = await controller.getMineById(mockUser, '1');
      expect(service.getOrError).toHaveBeenCalledWith({
        filterConditions: { authId: mockUser.id, id: '1' },
        relations: ['auth'],
      });
      expect(result).toEqual(record);
    });
  });

  describe('getById', () => {
    it('should fetch a health record by id', async () => {
      const record = { id: '2', name: 'Jane' };
      mockHealthService.getOrError.mockResolvedValue(record);

      const result = await controller.getById('2');
      expect(service.getOrError).toHaveBeenCalledWith({
        filterConditions: { id: '2' },
        relations: ['auth'],
      });
      expect(result).toEqual(record);
    });
  });

  describe('delete', () => {
    it('should call service.deleteOrError', async () => {
      mockHealthService.deleteOrError.mockResolvedValue(undefined);

      const result = await controller.delete('3');
      expect(service.deleteOrError).toHaveBeenCalledWith({
        filterConditions: { id: '3' },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should call service.update with correct id and dto', async () => {
      const dto: UpdateHealthDto = {
        firstName: 'Updated',
        lastName: 'User',
      };

      const updated = { id: '4', ...dto };
      mockHealthService.update.mockResolvedValue(updated);

      const result = await controller.update('4', dto);
      expect(service.update).toHaveBeenCalledWith('4', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('create', () => {
    it('should call service.create with DTO', async () => {
      const dto: CreateHealthDto = {
        fullName: 'New User',
        phone: '1234567890',
        authId: 'user-id-1',
        dob: new Date().toISOString(),
        gender: Gender.Female,
      };

      const created = { id: '5', ...dto };
      mockHealthService.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
