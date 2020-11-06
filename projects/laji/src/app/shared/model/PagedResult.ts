'use strict';

export interface PagedResult<T> {

  currentPage: number;

  lastPage?: number;

  nextPage?: number;

  pageSize: number;

  prevPage?: number;

  results: T[];

  total: number;

  aggregations?: {
    [agg: string]: {
      values: {[field: string]: string},
      count: number;
    }[]
  };
}
