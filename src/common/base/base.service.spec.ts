import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { BaseService } from './base.service';
import { NotFoundException } from '@nestjs/common';

class DummyEntity {
  id: string;
  name: string;
}

describe('BaseService', () => {
  let service: BaseService<DummyEntity>;
  let mockRepo: Partial<Record<keyof Repository<DummyEntity>, any>>;

  const createQueryBuilderMock = () => {
    const qb: any = {
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    };
    return qb;
  };

  beforeEach(async () => {
    mockRepo = {
      metadata: {
        tableName: 'dummy',
      },
      createQueryBuilder: jest.fn(),
      softDelete: jest.fn(),
    };

    service = new BaseService<DummyEntity>(
      mockRepo as unknown as Repository<DummyEntity>,
      'Dummy',
    );
  });

  describe('getAll', () => {
    it('should return paginated results with filters and search', async () => {
      const qb = createQueryBuilderMock();
      qb.getManyAndCount.mockResolvedValue([[{ id: '1', name: 'Test' }], 1]);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAll({
        pageOpts: { page: 1, limit: 10, search: 'Test' },
        filterConditions: { name: 'Test' },
        searchableFields: ['name'],
        sortBy: 'createdAt',
      });

      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('getOrError', () => {
    it('should return the entity if found', async () => {
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue({ id: '1', name: 'Test' });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getOrError({
        filterConditions: { id: '1' },
      });

      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('should throw NotFoundException if entity not found', async () => {
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue(undefined);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.getOrError({ filterConditions: { id: '1' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOrError', () => {
    it('should delete the entity if found', async () => {
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue({ id: '1' });
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await service.deleteOrError({ filterConditions: { id: '1' } });

      expect(mockRepo.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if entity not found', async () => {
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue(undefined);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.deleteOrError({ filterConditions: { id: '2' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
