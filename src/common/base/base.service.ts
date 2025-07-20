import { Repository, ObjectLiteral } from 'typeorm';
import {
  PaginatedResultDto,
  PaginationMetadataDto,
} from '../dto/pagination.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindAllOption } from '../interfaces/find-all-option.interface';
import { FindOneOption } from '../interfaces/find-one-option.interface';

@Injectable()
export class BaseService<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    private readonly entityName?: string,
  ) {}

  async getAll(opts?: FindAllOption<T>): Promise<PaginatedResultDto<T>> {
    const {
      pageOpts,
      filterConditions,
      sortBy,
      sortOrder = 'DESC',
      relations,
      fields,
      searchableFields,
      searchRelations,
    } = opts || {};
    const { page = 1, limit = 10, search } = pageOpts || {};
    const alias = this.repository.metadata.tableName;

    const query = this.repository
      .createQueryBuilder(alias)
      .take(limit)
      .skip((page - 1) * limit);

    if (filterConditions) {
      Object.entries(filterConditions).forEach(([key, value]) => {
        query.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      });
    }

    // Field loading
    if (fields?.length) {
      fields.forEach((field) => {
        query.addSelect(`${alias}.${String(field)}`);
      });
    }

    // Relation loading
    if (relations?.length) {
      relations.forEach((relation) => {
        const joinAlias = `${relation}_alias`;
        query.leftJoinAndSelect(`${alias}.${relation}`, joinAlias);
      });
    }

    if (search) {
      // Relation search
      if (searchRelations?.length) {
        searchRelations.forEach(({ relation, field }) => {
          if (!relations?.includes(relation)) return;

          const joinAlias = `${relation}_alias`;
          query.orWhere(`${joinAlias}.${field} ILIKE :search`, {
            search: `%${search}%`,
          });
        });
      }

      // Field search
      if (searchableFields?.length) {
        searchableFields.forEach((field) => {
          query.orWhere(`${alias}.${String(field)} ILIKE :search`, {
            search: `%${search}%`,
          });
        });
      }
    }

    // Sorting
    if (sortBy) {
      query.orderBy(
        `${alias}.${String(sortBy)}`,
        sortOrder.toUpperCase() as any,
      );
    }

    const [items, total] = await query.getManyAndCount();

    const pagination = new PaginationMetadataDto(total, page, limit);
    return { items, pagination };
  }

  async getOrError(opts?: FindOneOption<T>): Promise<T> {
    const { filterConditions, relations, fields } = opts || {};
    const alias = this.repository.metadata.tableName;

    const query = this.repository.createQueryBuilder(alias);

    // Apply select fields
    if (fields?.length) {
      fields.forEach((field) => {
        query.addSelect(`${alias}.${String(field)}`);
      });
    }

    // Apply relations
    if (relations?.length) {
      relations.forEach((relation) => {
        const joinAlias = `${relation}_alias`;
        query.leftJoinAndSelect(`${alias}.${relation}`, joinAlias);
      });
    }

    // Apply filter conditions
    if (filterConditions) {
      Object.entries(filterConditions).forEach(([key, value], index) => {
        const paramKey = `param_${index}`;
        query.andWhere(`${alias}.${key} = :${paramKey}`, {
          [paramKey]: value,
        });
      });
    }

    const entity = await query.getOne();

    if (!entity) {
      throw new NotFoundException(`${this.entityName} record not found`);
    }

    return entity;
  }

  async deleteOrError(opts?: FindOneOption<T>): Promise<void> {
    const { filterConditions } = opts || {};
    const alias = this.repository.metadata.tableName;

    const query = this.repository.createQueryBuilder(alias);

    // Apply filter conditions to find the record
    if (filterConditions) {
      Object.entries(filterConditions).forEach(([key, value], index) => {
        const paramKey = `param_${index}`;
        query.andWhere(`${alias}.${key} = :${paramKey}`, {
          [paramKey]: value,
        });
      });
    }

    const entity = await query.getOne();

    if (!entity) {
      throw new NotFoundException(`${this.entityName} record not found`);
    }

    await this.repository.softDelete(entity.id);
  }
}
