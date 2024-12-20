import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NavigationExtras, Params, Router } from '@angular/router';
import { TaxonomySearchQueryInterface } from '../model/taxonomy-search-query.interface';
import { SearchQueryInterface } from '../../../shared-modules/search-filters/search-query.interface';

@Injectable()
export class TaxonomySearchQuery implements SearchQueryInterface {
  private static readonly defaultFields: string[] = [
    'vernacularName', 'scientificName', 'typeOfOccurrenceInFinland',
    'latestRedListStatusFinland', 'administrativeStatuses',
    'synonymNames'
  ];

  public queryType = 'taxonomy';
  private queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public query!: TaxonomySearchQueryInterface;

  public listOptions!: {
    page: number;
    sortOrder: string;
    selected: string[];
  };
  public imageOptions!: {
    page: number;
  };

  constructor(
    private router: Router
  ) {
    this.init();
  }

  public init(): void {
    this.query = {};

    if (!this.listOptions) {
      this.listOptions = {
        page:      1,
        sortOrder: 'taxonomic',
        selected:  TaxonomySearchQuery.defaultFields
      };
    } else {
      this.listOptions = { ...this.listOptions, page: 1 };
    }

    this.imageOptions = {
      page: 1
    };
  }

  public resetFields() {
    this.listOptions.selected = TaxonomySearchQuery.defaultFields;
  }

  public setQueryFromParams(params: Params) {
    const newQuery: Record<string, any> = {};

    newQuery['informalGroupFilters'] = params['informalGroupFilters'];
    newQuery['target'] = params['target'];
    newQuery['onlyFinnish'] = params['onlyFinnish'] === 'true' ? true : undefined;

    newQuery['invasiveSpeciesFilter'] =
      params['invasiveSpeciesFilter'] === 'true' ? true : (params['invasiveSpeciesFilter'] === 'false' ? false : undefined);
    newQuery['hasBoldData'] =
      params['hasBoldData'] === 'true' ? true : (params['hasBoldData'] === 'false' ? false : undefined);

    const arrayKeys = ['redListStatusFilters', 'adminStatusFilters',
      'typesOfOccurrenceFilters', 'typesOfOccurrenceNotFilters', 'taxonRanks',
      'primaryHabitat', 'anyHabitat'
    ];
    for (const key of arrayKeys) {
      newQuery[key] = this.getArrayParam(params, key);
    }

    if (JSON.stringify(this.query) !== JSON.stringify(newQuery)) {
      this.init();
      this.query = newQuery;
    }

    this.queryUpdate();
  }

  public updateUrl(skipParams?: string[]): void {
    const extra: NavigationExtras = {skipLocationChange: false};
    const queryParams: Record<string, any> = {};

    let key: keyof TaxonomySearchQueryInterface;
    for (key in this.query) {
      if (!this.query.hasOwnProperty(key) || (skipParams && skipParams.indexOf(key) !== -1)) {
        continue;
      }
      if (this.query[key] === '' || (Array.isArray(this.query[key]) && (this.query[key] as any[]).length === 0)) {
        (this.query as SearchQueryInterface)[<keyof SearchQueryInterface>key] = undefined;
      }

      queryParams[key] = this.query[key];
    }

    if (Object.keys(this.query).length > 0) {
      extra['queryParams'] = queryParams;
    }
    this.router.navigate(
      [],
      extra
    );

    this.queryUpdate();
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }

  private getArrayParam(params: Params, key: string) {
    let value = params[key];
    if (value && !Array.isArray(value)) {
      value = [value];
    }
    return value;
  }
}
