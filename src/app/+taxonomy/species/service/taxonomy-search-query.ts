import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Params, Router } from '@angular/router';
import { TaxonomySearchQueryInterface } from '../model/taxonomy-search-query.interface';
import { SearchQueryInterface } from '../../../shared-modules/search-filters/search-query.interface';

@Injectable()
export class TaxonomySearchQuery implements SearchQueryInterface {
  public queryType = 'taxonomy';
  private queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public query: TaxonomySearchQueryInterface;

  public listOptions: {
    page: number,
    sortOrder: string,
    selected: string[]
  };
  public imageOptions: {
    page: number
  };

  constructor(
    private router: Router
  ) {
    this.init();
  }

  public init(): void {
    this.query = {};
    this.listOptions = {
      page: 1,
      sortOrder: 'taxonomic',
      selected: ['vernacularName', 'scientificName', 'typeOfOccurrenceInFinland',
        'latestRedListStatusFinland', 'administrativeStatuses', 'synonymNames']
    };
    this.imageOptions = {
      page: 1
    };
  }

  public setQueryFromParams(params: Params) {
    const newQuery = {};

    newQuery['informalGroupFilters'] = params['informalGroupFilters'];
    newQuery['target'] = params['target'];
    newQuery['onlyFinnish'] = params['onlyFinnish'] === 'true' ? true : undefined;

    newQuery['invasiveSpeciesFilter'] =
      params['invasiveSpeciesFilter'] === 'true' ? true : (params['invasiveSpeciesFilter'] === 'false' ? false : undefined);

    const arrayKeys = ['redListStatusFilters', 'adminStatusFilters',
      'typesOfOccurrenceFilters', 'typesOfOccurrenceNotFilters', 'taxonRanks'
    ];
    for (let i = 0; i < arrayKeys.length; i++) {
      const key = arrayKeys[i];
      newQuery[key] = this.getArrayParam(params, key);
    }

    if (JSON.stringify(this.query) !== JSON.stringify(newQuery)) {
      this.init();
      this.query = newQuery;
    }

    this.queryUpdate();
  }

  public updateUrl(): void {
    const extra = {skipLocationChange: false};
    const queryParams = {};

    for (const key in this.query) {
      if (!this.query.hasOwnProperty(key)) {
        continue;
      }
      if (this.query[key] === '' || (Array.isArray(this.query[key]) && this.query[key].length === 0)) {
        this.query[key] = undefined;
      }

      queryParams[key] = this.query[key];
    }

    if (Object.keys(this.query).length > 0) {
      extra['queryParams'] = queryParams;
    } else {
      extra['preserveQueryParams'] = false;
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
