import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, Params } from '@angular/router';
import { TaxonomySearchQueryInterface } from './taxonomy-search-query.interface';
import { AutocompleteApi, AutocompleteMatchType } from '../../shared/api/AutocompleteApi';
import { Util } from '../../shared/service/util.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TaxonomySearchQuery {

  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public page: number;
  public sortOrder: string;
  public selected: string[];

  public query: TaxonomySearchQueryInterface;
  public targetInfo: {id: string, name: string};

  constructor(
    private router: Router,
    private autocompleteService: AutocompleteApi
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
    this.targetInfo = undefined;
  }

  public setQueryFromParams(params: Params): boolean {
    const newQuery: TaxonomySearchQueryInterface = {};
    newQuery.informalTaxonGroupId = params['informalTaxonGroupId'];
    newQuery.target = params['target'];
    newQuery.onlyFinnish = params['onlyFinnish'] === 'true' ? true : undefined;

    if (params['invasiveSpeciesFilter'] === 'true') {
      newQuery.invasiveSpeciesFilter = true;
    }
    if (params['invasiveSpeciesFilter'] === 'false') {
      newQuery.invasiveSpeciesFilter = false;
    }

    let redListFilters = params['redListStatusFilters'];
    if (redListFilters && !Array.isArray(redListFilters)) {
      redListFilters = [redListFilters];
    }
    newQuery.redListStatusFilters = redListFilters;

    if (params['adminStatusFilters']) {
      let adminFilters = Util.clone(params['adminStatusFilters']);
      if (adminFilters && !Array.isArray(adminFilters)) {
        adminFilters = [adminFilters];
      }
      newQuery.adminStatusFilters = adminFilters;
    }

    if (this.queryAsString(this.query) !== this.queryAsString(newQuery)) {
      this.query = newQuery;
      return true;
    }

    return false;
  }

  private queryAsString(query) {
    return JSON.stringify({
      informalTaxonGroupId: query.informalTaxonGroupId,
      target: query.target,
      onlyFinnish: query.onlyFinnish,
      invasiveSpeciesFilter: query.invasiveSpeciesFilter,
      redListStatusFilters: query.redListStatusFilters,
      adminStatusFilters: query.adminStatusFilters,
      typesOfOccurrenceFilters: query.typesOfOccurrenceFilters,
      typesOfNotOccurrenceFilters: query.typesOfNotOccurrenceFilters
    });
  }

  public setTargetInfo(): Observable<boolean> {
    const taxon = this.query.target;
    let formSubmit = false;

    return this.autocompleteService.autocompleteFindByField({
        field: 'taxon',
        q: taxon,
        limit: '1',
        informalTaxonGroup: this.query.informalTaxonGroupId,
        matchType: AutocompleteMatchType.exact
      })
        .map(data => {
          if (taxon === this.query.target) {
            if (data.length === 1) {
              this.targetInfo = {id: data[0].key, name: taxon};
            } else {
              this.query.target = undefined;
              formSubmit = true;
            }
          }
          return formSubmit;
        });
  }

  public hasCorrectTargetInfo(): boolean {
    if (!this.query.target) {
      return true;
    }

    return this.targetInfo && this.targetInfo.name === this.query.target;
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }
}
