import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { operations } from 'projects/laji-api-client-b/generated/api.d';

type Query = NonNullable<operations['TaxaController_getPageWithFilters']['parameters']['query']>;
type RawFilters = NonNullable<operations['TaxaController_getPageWithFilters']['requestBody']>['content']['application/json'];
  // It allows non-array strings but we use only arrays to narrow down acrobatics with types.
type Filters = { [K in keyof RawFilters]: Exclude<RawFilters[K], string> };

@Injectable()
export class TaxonomySearch {
  private static readonly defaultFields: string[] = [
    'vernacularName', 'scientificName', 'typeOfOccurrenceInFinland',
    'latestRedListStatusFinland', 'administrativeStatuses',
    'synonymNames'
  ];

  private queryUpdatedSource = new Subject<void>();
  queryUpdated$ = this.queryUpdatedSource.asObservable();

  taxonId?: string;
  query!: Query;
  filters!: Filters;

  listOptions!: {
    page: number;
    sortOrder: string;
    selected: string[];
  };
  imageOptions!: {
    page: number;
  };

  constructor(
    private router: Router
  ) {
    this.init();
  }

  public init(): void {
    this.query = {};
    this.filters = {};

    if (!this.listOptions) {
      this.listOptions = {
        page:      1,
        sortOrder: 'taxonomic',
        selected:  TaxonomySearch.defaultFields
      };
    } else {
      this.listOptions = { ...this.listOptions, page: 1 };
    }

    this.imageOptions = {
      page: 1
    };
  }

  public resetFields() {
    this.listOptions.selected = TaxonomySearch.defaultFields;
  }

  public setQueryFromParams(rawParams: Record<string, string>) {
    const { taxonId: newTaxonId, ...params } = rawParams;

    const newFilters = (Object.keys(params) as (keyof Filters)[]).reduce((filters, param) => {
      const rawParam = params[param];
      filters[param] = (rawParam === 'true'
        ? true
        : rawParam === 'false'
          ? false
          : rawParam.split(',')) as any;
      return filters;
    }, {} as Filters);

    if (JSON.stringify(this.filters) !== JSON.stringify(newFilters) || this.taxonId !== newTaxonId) {
      this.init();
      this.filters = newFilters;
      this.taxonId = newTaxonId;
    }

    this.queryUpdate();
  }

  public updateUrl(skipParams?: (keyof (Query & Filters))[]): void {
    const queryParams: Record<string, any> = {};

    for (const key in this.filters) {
      if (skipParams?.includes(key as any)) {
        continue;
      }
      const param = (this.filters as any)[key];
      if (param === '' || (Array.isArray(param) && (param as any[]).length === 0)) {
        delete (this.filters as any)[key];
        continue;
      }

      queryParams[key] = Array.isArray(param)
        ? (param as string[]).join(',')
        : param;
    }

    if (this.taxonId) {
      queryParams.taxonId = this.taxonId;
    }

    this.router.navigate(
      [],
      { queryParams, skipLocationChange: false }
    );

    this.queryUpdate();
  }

  public queryUpdate(): void {
    this.queryUpdatedSource.next();
  }
}
