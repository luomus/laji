import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, Params } from '@angular/router';
import { TaxonomySearchQueryInterface } from './taxonomy-search-query.interface';
import { AutocompleteApi } from '../shared/api/AutocompleteApi';
import { Util } from '../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TaxonomySearchQuery {

  public queryUpdatedSource = new Subject<any>();
  public queryUpdated$ = this.queryUpdatedSource.asObservable();

  public page = 1;
  public sortOrder = 'taxonomic';
  public selected: string[] = [ 'id', 'taxonRank', 'scientificName', 'scientificNameAuthorship', 'vernacularName',
    'finnish', 'typeOfOccurrenceInFinland'];

  public query: TaxonomySearchQueryInterface = {};
  public targetId: string;

  public loading = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private autocompleteService: AutocompleteApi
  ) { }

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
    this.selected = [ 'id', 'taxonRank', 'scientificName', 'scientificNameAuthorship', 'vernacularName',
      'finnish', 'typeOfOccurrenceInFinland'];
    this.targetId = undefined;
  }

  public setQueryFromParams(params: Params) {
    this.query = {};
    this.query.informalTaxonGroupId = params['informalTaxonGroupId'];
    this.query.target = params['target'];
    this.query.onlyFinnish = params['onlyFinnish'] === 'true' ? true : undefined;

    if (params['invasiveSpeciesFilter'] === 'true') {
      this.query.invasiveSpeciesFilter = true;
    }
    if (params['invasiveSpeciesFilter'] === 'false') {
      this.query.invasiveSpeciesFilter = false;
    }

    let redListFilters = params['redListStatusFilters'];
    if (redListFilters && !Array.isArray(redListFilters)) {
      redListFilters = [redListFilters];
    }
    this.query.redListStatusFilters = redListFilters;

    if (params['adminStatusFilters']) {
      let adminFilters = Util.clone(params['adminStatusFilters']);
      if (adminFilters && !Array.isArray(adminFilters)) {
        adminFilters = [adminFilters];
      }
      this.query.adminStatusFilters = adminFilters;
    }
  }

  public initTargetId(): Observable<boolean> {
    this.loading = true;

    return this.autocompleteService.autocompleteFindByField({
        field: 'taxon',
        q: this.query.target,
        limit: '1',
        includePayload: true,
        lang: this.translate.currentLang,
        informalTaxonGroup: this.query.informalTaxonGroupId
      })
        .map(data => {
          this.targetId = data[0].key;
          this.loading = false;
          return true;
        });
  }

  public queryUpdate(data = {}): void {
    this.queryUpdatedSource.next(data);
  }
}
