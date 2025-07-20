import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';

export class PageOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @Type(() => String)
  search?: string;
}

export class PaginationMetadataDto {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;

  constructor(totalItems: number, currentPage: number, itemsPerPage: number) {
    this.totalItems = totalItems;
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;
    this.totalPages = Math.ceil(totalItems / itemsPerPage);
  }
}

export class PaginatedResultDto<T> {
  items: T[];
  pagination: PaginationMetadataDto;

  constructor(items: T[], pagination: PaginationMetadataDto) {
    this.items = items;
    this.pagination = pagination;
  }
}
