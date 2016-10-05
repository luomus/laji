'use strict';

export interface PagedResult<T> {

  currentPage: number;

  lastPage?: number;

  nextPage?: number;

  pageSize: number;

  prevPage?: number;

  results: T[];

  total: number;
}
