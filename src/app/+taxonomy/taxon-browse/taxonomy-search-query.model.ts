import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, Params } from '@angular/router';
import { TaxonomySearchQueryInterface } from './taxonomy-search-query.interface';

@Injectable()
export class TaxonomySearchQuery {

  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public page: number;
  public sortOrder: string;
  public selected: string[];

  public query: TaxonomySearchQueryInterface;

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
    this.page = 1;
    this.sortOrder = 'taxonomic';
    this.selected = ['vernacularName', 'scientificName', 'typeOfOccurrenceInFinland',
      'latestRedListStatusFinland', 'administrativeStatuses', 'synonymNames'];
  }

  public setQueryFromParams(params: Params): boolean {
    const newQuery: TaxonomySearchQueryInterface = {};
    newQuery.informalGroupFilters = params['informalGroupFilters'];
    newQuery.target = params['target'];
    newQuery.onlyFinnish = params['onlyFinnish'] === 'true' ? true : undefined;

    if (params['invasiveSpeciesFilter'] === 'true') {
      newQuery.invasiveSpeciesFilter = true;
    }
    if (params['invasiveSpeciesFilter'] === 'false') {
      newQuery.invasiveSpeciesFilter = false;
    }

    const arrayKeys = ['redListStatusFilters', 'adminStatusFilters', 'typesOfOccurrenceFilters', 'typesOfOccurrenceNotFilters'];
    for (let i = 0; i < arrayKeys.length; i++) {
      const key = arrayKeys[i];
      newQuery[key] = this.getArrayParam(params, key);
    }

    if (this.queryAsString(this.query) !== this.queryAsString(newQuery)) {
      this.query = newQuery;
      return true;
    }

    return false;
  }

  private getArrayParam(params, key) {
    let value = params[key];
    if (value && !Array.isArray(value)) {
      value = [value];
    }
    return value;
  }

  private queryAsString(query) {
    return JSON.stringify({
      informalGroupFilters: query.informalGroupFilters,
      target: query.target,
      onlyFinnish: query.onlyFinnish,
      invasiveSpeciesFilter: query.invasiveSpeciesFilter,
      redListStatusFilters: query.redListStatusFilters,
      adminStatusFilters: query.adminStatusFilters,
      typesOfOccurrenceFilters: query.typesOfOccurrenceFilters,
      typesOfNotOccurrenceFilters: query.typesOfNotOccurrenceFilters
    });
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }
}
