import { PageOptionsDto } from '../dto/pagination.dto';
import { Brackets, FindOptionsWhere } from 'typeorm';

export type SortOrder = 'ASC' | 'DESC';

export interface FindAllOption<T> {
  /**
   * For basic pagination (page, limit)
   */
  pageOpts?: PageOptionsDto;

  /**
   * For filtering conditions (where clause)
   */
  filterConditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[] | Brackets;

  /**
   * For sorting by a specific field
   */
  sortBy?: keyof T | string;

  /**
   * Order to sort the results
   */
  sortOrder?: SortOrder;

  /**
   * Relations to load
   */
  relations?: (string | string[])[];

  /**
   * Specific fields/columns to select
   */
  fields?: (keyof T | string)[];

  /**
   * Searchable fields
   */
  searchableFields?: (keyof T)[];

  /**
   * Search relations
   */
  searchRelations?: { relation: string; field: string }[];
}