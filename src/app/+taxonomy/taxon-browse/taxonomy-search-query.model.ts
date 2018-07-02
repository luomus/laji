import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, Params } from '@angular/router';
import { TaxonomySearchQueryInterface } from './taxonomy-search-query.interface';

@Injectable()
export class TaxonomySearchQuery {

  public queryUpdatedSource = new Subject<any>();
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
  public treeOptions: {
    onlyFinnish: boolean,
    showOnlySpecies: boolean
  };

  constructor(
    private router: Router
  ) {
    this.empty();
  }

  public updateUrl(skipHistory: boolean = false): void {
    const extra = {skipLocationChange: skipHistory};
    if (Object.keys(this.query).length > 0) {
      for (const key in this.query) {
        if (this.query[key] === '' || (Array.isArray(this.query[key]) && this.query[key].length === 0)) {
          this.query[key] = undefined;
        }
      }
      extra['queryParams'] = this.query;
    } else {
      extra['preserveQueryParams'] = false;
    }
    this.router.navigate(
      [],
      extra
    );
  }

  public empty(): void {
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
    this.treeOptions = {
      onlyFinnish: true,
      showOnlySpecies: false
    };
  }

  public setQueryFromParams(params: Params) {
    this.query.informalGroupFilters = params['informalGroupFilters'];
    this.query.target = params['target'];
    this.query.onlyFinnish = params['onlyFinnish'] === 'true' ? true : undefined;

    if (params['invasiveSpeciesFilter'] === 'true') {
      this.query.invasiveSpeciesFilter = true;
    }
    if (params['invasiveSpeciesFilter'] === 'false') {
      this.query.invasiveSpeciesFilter = false;
    }

    const arrayKeys = ['redListStatusFilters', 'adminStatusFilters', 'typesOfOccurrenceFilters', 'typesOfOccurrenceNotFilters'];
    for (let i = 0; i < arrayKeys.length; i++) {
      const key = arrayKeys[i];
      this.query[key] = this.getArrayParam(params, key);
    }
  }

  private getArrayParam(params, key) {
    let value = params[key];
    if (value && !Array.isArray(value)) {
      value = [value];
    }
    return value;
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }
}
