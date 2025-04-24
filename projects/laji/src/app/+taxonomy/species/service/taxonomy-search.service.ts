import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { operations } from 'projects/laji-api-client-b/generated/api.d';

type Query = NonNullable<operations['TaxaController_getPageWithFilters']['parameters']['query']>;
type RawFilters = NonNullable<operations['TaxaController_getPageWithFilters']['requestBody']>['content']['application/json'];
  // It allows non-array strings but we use only arrays to narrow down acrobatics with types.
type Filters = { [ K in keyof RawFilters]: Exclude<RawFilters[K], string> };

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
    // const params = convertOldParamModelToNew(rawParams);
    const { target: newTaxonId, ...params } = rawParams;

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
    const extra: NavigationExtras = {skipLocationChange: false};
    const queryParams: Record<string, any> = {};

    function updateQueryParamsFrom(container: Record<string, unknown>) {
      for (const key in container) {
        if (skipParams?.includes(key as any)) {
          continue;
        }
        if (container[key] === '' || (Array.isArray(container[key]) && (container[key] as any[]).length === 0)) {
          container[key] = undefined;
        }

        queryParams[key] = Array.isArray(container[key])
          ? (container[key] as string[]).join(',')
          : container[key];
      }
    }
    updateQueryParamsFrom(this.query);
    updateQueryParamsFrom(this.filters);

    if (Object.keys(queryParams).length > 0) {
      extra['queryParams'] = queryParams;
    }
    this.router.navigate(
      [],
      extra
    );

    this.queryUpdate();
  }

  public queryUpdate(): void {
    this.queryUpdatedSource.next();
  }
}

// const convertOldParamModelToNew = (params: Record<string, string>) => {
//   const oldToNew: Record<string, keyof Filters> = {
//     informalGroupFilters: 'informalTaxonGroups',
//     onlyFinnish: 'finnish',
//     invasiveSpeciesFilter: 'invasiveSpecies',
//     hasBoldData: 'hasBold',
//     redListStatusFilters: 'latestRedListStatusFinland.status',
//     adminStatusFilters: 'administrativeStatuses',
//     taxonRanks: 'taxonRank',
//     primaryHabitat: 'primaryHabitat.habitat',
//     anyHabitat: 'anyHabitatSearchStrings',
//     typesOfOccurrenceFilters: 'typeOfOccurrenceInFinland',
//   };
//
//   // TODO are params arrays ever here?? Should this be comma-separated?
//   if (params.typesOfOccurrenceNotFilters) {
//     (params as any).typesOfOccurrenceFilters = [...(params.typesOfOccurrenceFilters || []), '!params.typesOfOccurrenceNotFilters'];
//   }
//
//   // TODO values of the map are string or arrays and booleans...?
//   return Object.keys(oldToNew).reduce<Partial<Record<keyof Filters, string>>>((_params, oldKey) => {
//     if (oldKey in params) {
//       _params[oldToNew[oldKey]] = params[oldKey];
//     }
//     return _params;
//   }, {...params});
// };
