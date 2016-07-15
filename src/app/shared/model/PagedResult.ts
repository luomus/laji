
'use strict';
import * as models from './index';

export interface PagedResult<T> {

    currentPage: number;

    lastPage?: number;

    nextPage?: number;

    pageSize: number;

    prevPage?: number;

    results:T[];

    total: number;
}
