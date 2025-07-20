import { Brackets, FindOptionsWhere } from 'typeorm';

export interface FindOneOption<T> {
  /**
   * For filtering conditions (where clause)
   */
  filterConditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[] | Brackets;

  /**
   * Relations to load
   */
  relations?: (string | string[])[];

  /**
   * Specific fields/columns to select
   */
  fields?: (keyof T | string)[];
}
